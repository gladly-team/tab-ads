import { get } from 'lodash/object'
import { getAdDataStore } from 'src/utils/storage'
import BidResponse from 'src/utils/BidResponse'

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

// TODO
const getTopBidForAd = adId => {
  // TODO
  return {
    adId,
    revenue: 0.23,
    encodedRevenue: 'abc-123',
    advertiserName: 'example',
    adSize: '728x90',
    GAMAdvertiserId: null,
  }
}

/**
 * Get the winning BidResponse data for the ad with ID `adId`.
 * @param {String} adId - An ad ID.
 * @return {Object} A BidResponse, the winning bid for this ad
 */
export const getWinningBidForAd = adId => {
  const GAMAdvertiserId = getGAMAdvertiserIdForDisplayedAd(adId)
  const topBid = getTopBidForAd(adId)
  return BidResponse({
    ...topBid,
    adId,
    GAMAdvertiserId,
  })
}

/**
 * Get the winning BidResponse data for each ad ID
 * @param {String} adId - An ad ID.
 * @return {Object} An object with keys equal to ad IDs, each with
 *   value BidResponse or null
 */
export const getAllWinningBids = () => {
  // TODO
  return {}
}
