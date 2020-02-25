import { get } from 'lodash/object'
import bidders from 'src/bidders'
import { getAdDataStore } from 'src/utils/storage'
import BidResponse from 'src/utils/BidResponse'
import DisplayedAdInfo from 'src/utils/DisplayedAdInfo'

/**
 * Get the Google Ad Manager advertiser ID of the advertiser that
 * has displayed an ad.
 * @param {String} adId - An ad ID.
 * @return {Number|null} The Google Ad Manager advertiser ID.
 */
const getGAMAdvertiserIdForDisplayedAd = adId => {
  const store = getAdDataStore()
  const slot = get(store, ['adManager', 'slotsRendered', adId])

  // If there's no data, the slot has not rendered, so there is
  // no winning bid.
  if (!slot) {
    return null
  }

  // AdSense will not have an ID. We use 99.
  const DEFAULT_ADVERTISER_ID = 99
  const GAMAdvertiserId = get(slot, 'advertiserId', DEFAULT_ADVERTISER_ID)
  return GAMAdvertiserId
}

// FIXME: filter out bidders that weren't included in the ad server request.
/**
 * Get the winning BidResponse for the ad with ID `adId`, merging any
 * encodedRevenue value with the top revenue value.
 * @param {String} adId - An ad ID.
 * @return {Object|null} A BidResponse, the winning bid for this ad,
 *   or null if there is no bid.
 */
const getTopBidForAd = adId => {
  const store = getAdDataStore()
  const allBidsForAd = bidders.reduce((acc, bidder) => {
    const bidsForBidder = get(store, [
      'bidResponses',
      bidder.name,
      'bidResponses',
      adId,
    ])
    return acc.concat(bidsForBidder)
  }, [])

  // We get both the top unencoded revenue bid response and any
  // encoded revenue bid response. We want to send both the revenue
  // and encodedRevenue values because we don't know which is
  // higher. Note that this only works because we know we only have
  // one bidder with encoded revenue values.
  const topBids = allBidsForAd.reduce(
    (acc, bid) => {
      const newAcc = {
        topRevenueBid: { ...acc.topRevenueBid },
        encodedRevenueBid: { ...acc.encodedRevenueBid },
      }

      // If this bid has a higher revenue value, set it as the new
      // top-revenue bid. Note that this only works because we know we
      // only have one bidder with encoded revenue values.
      if (get(bid, 'revenue', 0) > get(acc, 'topRevenueBid.revenue', 0)) {
        newAcc.topRevenueBid = bid
      }

      // If this bid has an encodedRevenue value, set it as the bid
      // with encodedRevenue.
      if (get(bid, 'encodedRevenue')) {
        newAcc.encodedRevenueBid = bid
      }
      return newAcc
    },
    { topRevenueBid: {}, encodedRevenueBid: {} }
  )

  // Combine the top revenue bid with the encoded revenue bid.
  const topBidResponse = BidResponse({
    ...get(topBids, 'topRevenueBid', {}),
    encodedRevenue: get(topBids, 'encodedRevenueBid.encodedRevenue', null),
  })
  return topBidResponse
}

/**
 * Get the winning DisplayedAdInfo data for the ad with ID `adId`.
 * @param {String} adId - An ad ID.
 * @return {Object|null} A DisplayedAdInfo, the winning bid for this ad,
 *   or null if an ad hasn't been displayed.
 */
export const getWinningBidForAd = adId => {
  const GAMAdvertiserId = getGAMAdvertiserIdForDisplayedAd(adId)
  if (!GAMAdvertiserId) {
    return null
  }
  const topBid = getTopBidForAd(adId)
  return DisplayedAdInfo({
    ...topBid,
    adId,
    GAMAdvertiserId,
  })
}

/**
 * Get the winning DisplayedAdInfo data for each ad ID
 * @param {String} adId - An ad ID.
 * @return {Object} An object with keys equal to ad IDs, each with
 *   value DisplayedAdInfo or null
 */
export const getAllWinningBids = () => {
  // TODO
  return {}
}
