import { isEmpty } from 'lodash/lang'
import { get } from 'lodash/object'
import getBidders from 'src/getBidders'
import { getConfig } from 'src/config'
import { getAdDataStore } from 'src/utils/storage'
import BidResponse from 'src/utils/BidResponse'
import DisplayedAdInfo from 'src/utils/DisplayedAdInfo'

/**
 * Get the Google Ad Manager advertiser ID of the advertiser that
 * has displayed an ad.
 * @param {String} adId - An ad ID.
 * @return {Number|null} The Google Ad Manager advertiser ID.
 */
const getGAMAdvertiserIdForDisplayedAd = (adId) => {
  const store = getAdDataStore()
  const slot = get(store, ['adManager', 'slotsRendered', adId])

  // If there's no data, the slot has not rendered, so there is
  // no winning bid.
  if (!slot) {
    return null
  }

  // AdSense will not have an ID or will have an ID of zero. We use 99.
  const DEFAULT_ADVERTISER_ID = 99
  const GAMAdvertiserId =
    get(slot, 'advertiserId', null) || DEFAULT_ADVERTISER_ID
  return GAMAdvertiserId
}

/**
 * Get the Google Ad Manager ad slot ID of the displayed ad.
 * @param {String} adId - An ad ID.
 * @return {Number|null} The Google Ad Manager ad slot ID.
 */
const getGAMAdUnitId = (adId) => {
  const store = getAdDataStore()
  const renderedSlotData = get(store, ['adManager', 'slotsRendered', adId])

  // If there's no data, the slot has not rendered, so there is
  // no winning bid.
  if (!renderedSlotData) {
    return null
  }
  const adUnitId = renderedSlotData.slot.getAdUnitPath()
  return adUnitId
}

/**
 * Get the winning BidResponse for the ad with ID `adId`, merging any
 * encodedRevenue value with the top revenue value.
 * @param {String} adId - An ad ID.
 * @return {Object|null} A BidResponse, the winning bid for this ad,
 *   or null if there is no bid.
 */
const getTopBidForAd = (adId) => {
  const store = getAdDataStore()
  const bidders = getBidders()
  const allBidsForAd = bidders.reduce((acc, bidder) => {
    // If the bidder did not respond in time to be part of the
    // ad server request, don't consider their bids.
    if (!get(store, ['bidResponses', bidder.name, 'includedInAdRequest'])) {
      return acc
    }
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
  const encodedRevenue = get(topBids, 'encodedRevenueBid.encodedRevenue', null)
  const mergedBid = {
    ...get(topBids, 'encodedRevenueBid', {}),
    ...get(topBids, 'topRevenueBid', {}),
    ...(encodedRevenue && { encodedRevenue }),
  }

  if (isEmpty(mergedBid)) {
    return null
  }

  return BidResponse(mergedBid)
}

/**
 * Get the winning DisplayedAdInfo data for the ad with ID `adId`.
 * @param {String} adId - An ad ID.
 * @return {Object|null} A DisplayedAdInfo, the winning bid for this ad,
 *   or null if an ad hasn't been displayed.
 */
export const getWinningBidForAd = (adId) => {
  const GAMAdvertiserId = getGAMAdvertiserIdForDisplayedAd(adId)
  if (!GAMAdvertiserId) {
    return null
  }
  const GAMAdUnitId = getGAMAdUnitId(adId)
  const topBid = getTopBidForAd(adId)
  if (!topBid) {
    return null
  }
  return DisplayedAdInfo({
    ...topBid,
    adId,
    GAMAdvertiserId,
    GAMAdUnitId,
  })
}

/**
 * Get the winning DisplayedAdInfo data for each ad ID
 * @param {String} adId - An ad ID.
 * @return {Object} An object with keys equal to ad IDs, each with
 *   value DisplayedAdInfo or null
 */
export const getAllWinningBids = () => {
  const tabConfig = getConfig()
  const adUnits = get(tabConfig, 'adUnits', [])
  const winningBidsByAd = adUnits.reduce((acc, adUnit) => {
    return { ...acc, [adUnit.adId]: getWinningBidForAd(adUnit.adId) }
  }, {})
  return winningBidsByAd
}
