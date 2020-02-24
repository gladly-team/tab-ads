import { get } from 'lodash/object'
import { getAdDataStore } from 'src/utils/storage'
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

// TODO
const getTopBidForAd = adId => {
  // TODO
  return {
    adId,
    revenue: 0.23,
    encodedRevenue: 'abc-123',
    advertiserName: 'example',
    adSize: '728x90',
  }
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
