/* eslint import/no-dynamic-require: 0 */

// Run our built Prebid.js. Note that using `require` to load
// Prebid only when fetching bids appears to cause the Prebid
// auction to end substantially later, putting it at a disadvantage
// relative to other bidders.
import 'src/providers/prebid/built/pb'

import { get } from 'lodash/object'
import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import Bidder from 'src/utils/Bidder'
import BidResponse from 'src/utils/BidResponse'
import logger from 'src/utils/logger'

/**
 * Given an ad unit object from the tab-ads config, return the
 * associated Prebid ad unit.
 * @param {Object} tabAdUnit - The tab-ads ad unit.
 * @param {Object} config - The tab-ads config object.
 * @return {Object} A Prebid ad unit config object.
 */
const getPrebidAdUnit = (tabAdUnit, config) => {
  const { leaderboard, rectangleAdPrimary, rectangleAdSecondary } =
    config.newTabAds
  switch (tabAdUnit.adId) {
    case leaderboard.adId:
      // Leaderboard-style ad
      return {
        code: tabAdUnit.adId,
        mediaTypes: {
          banner: {
            sizes: tabAdUnit.sizes,
          },
        },
        bids: [
          {
            bidder: 'sonobi',
            params: {
              dom_id: tabAdUnit.adId,
              ad_unit: tabAdUnit.adUnitId,
            },
          },
          {
            bidder: 'pulsepoint',
            params: {
              cf: '728X90',
              cp: '560174',
              ct: '460981',
            },
          },
          {
            bidder: 'aol',
            params: {
              // 'aol' is a built-in alias for One Mobile (Verizon SSP).
              // https://docs.prebid.org/dev-docs/bidders.html#onemobile
              dcn: '8a96954f01747430358b35f958c502f0',
              pos: '8a96954f01747430358b35fa26a402f4',
            },
          },
          {
            bidder: 'sovrn',
            params: {
              tagid: '438918',
            },
          },
          {
            bidder: 'openx',
            params: {
              unit: '538658529',
              delDomain: 'tabforacause-d.openx.net',
            },
          },
          // EMX Digital was formerly brealtime.
          // http://prebid.org/dev-docs/bidders.html#emx_digital
          {
            bidder: 'emx_digital',
            params: {
              tagid: '29672',
            },
          },
          {
            bidder: 'rhythmone',
            params: {
              placementId: '73423',
            },
          },
        ],
      }
    case rectangleAdPrimary.adId:
      // Rectangle-style ad
      return {
        code: tabAdUnit.adId,
        mediaTypes: {
          banner: {
            sizes: tabAdUnit.sizes,
          },
        },
        bids: [
          {
            bidder: 'sonobi',
            params: {
              dom_id: tabAdUnit.adId,
              ad_unit: tabAdUnit.adUnitId,
            },
          },
          {
            bidder: 'pulsepoint',
            params: {
              cf: '300X250',
              cp: '560174',
              ct: '460982',
            },
          },
          {
            bidder: 'aol',
            params: {
              dcn: '8a96954f01747430358b35f958c502f0',
              pos: '8a96954f01747430358b35fab61202f5',
            },
          },
          {
            bidder: 'sovrn',
            params: {
              tagid: '438916',
            },
          },
          {
            bidder: 'openx',
            params: {
              unit: '538658529',
              delDomain: 'tabforacause-d.openx.net',
            },
          },
          {
            bidder: 'emx_digital',
            params: {
              tagid: '29673',
            },
          },
          {
            bidder: 'rhythmone',
            params: {
              placementId: '73423',
            },
          },
        ],
      }
    case rectangleAdSecondary.adId:
      // Second rectangle-style ad
      return {
        code: tabAdUnit.adId,
        mediaTypes: {
          banner: {
            sizes: tabAdUnit.sizes,
          },
        },
        bids: [
          {
            bidder: 'sonobi',
            params: {
              dom_id: tabAdUnit.adId,
              ad_unit: tabAdUnit.adUnitId,
            },
          },
          {
            bidder: 'pulsepoint',
            params: {
              cf: '300X250',
              cp: '560174',
              ct: '665497',
            },
          },
          {
            bidder: 'aol',
            params: {
              dcn: '8a96954f01747430358b35f958c502f0',
              pos: '8a9690620174743031d835fb5fa90049',
            },
          },
          {
            bidder: 'sovrn',
            params: {
              tagid: '589343',
            },
          },
          {
            bidder: 'openx',
            params: {
              unit: '538658529',
              delDomain: 'tabforacause-d.openx.net',
            },
          },
          // {
          //   bidder: 'emx_digital',
          //   params: {
          //     tagid: 'TODO'
          //   }
          // },
          {
            bidder: 'rhythmone',
            params: {
              placementId: '73423',
            },
          },
        ],
      }
    default:
      return null
  }
}

/**
 * Given the tab-ads config, return an array of Prebid ad units.
 * @param {Object} config - The tab-ads config object.
 * @return {Array} An array of Prebid ad unit config objects.
 */
const getAdUnits = (config) => {
  const { adUnits } = config
  const prebidAdUnits = adUnits.map((adUnit) => getPrebidAdUnit(adUnit, config))
  return prebidAdUnits.filter((adUnit) => !!adUnit)
}

/**
 * Given Prebid bid responses, return an object keyed by ad ID with
 * value an array of BidResponses.
 * @param {Object} rawBidData - Prebid's "bids" object passed to the
 *   bidsBackHandler callback. See:
 *   http://prebid.org/dev-docs/publisher-api-reference.html#module_pbjs.requestBids
 * @return {Object} bidResponses - An object with keys equal to each adId
 *   for which there's a bid and values with an array of BidResponses, the
 *   bidder's normalized bids for that ad.
 */
const normalizeBidResponses = (rawBidData = {}) => {
  const normalizeBid = (adId, rawBid) =>
    BidResponse({
      adId,
      revenue: rawBid.cpm / 1000 || 0,
      advertiserName: rawBid.bidderCode,
      adSize: rawBid.size,
    })
  const normalizedBids = Object.keys(rawBidData).reduce((accumulator, adId) => {
    const rawBidsForAdId = get(rawBidData, [adId, 'bids'], [])
    return {
      ...accumulator,
      [adId]: rawBidsForAdId.map((rawBid) => normalizeBid(adId, rawBid)),
    }
  }, {})
  return normalizedBids
}

const name = 'prebid'

/**
 * Fetch bids from Prebid partners. Return a Promise that resolves
 * into bid response data when the bids return.
 * See Prebid setup docs here:
 * http://prebid.org/dev-docs/examples/basic-example.html
 * @param {Object} the tab-ads config
 * @return {Promise<Object>} BidResponseData
 * @return {Object} BidResponseData.bidResponses - An object with
 *   keys equal to each adId for which there's a bid and values with
 *   a BidResponse, the bidder's normalized bid for that ad.
 * @return {Object} BidResponseData.rawBidResponses - An object with
 *   keys equal to each adId for which there's a bid and values with
 *   the raw bid response structure (different for each bidder).
 */
const fetchBids = async (config) => {
  logger.debug(`Prebid: bids requested`)
  const { adUnits: tabAdUnits } = config
  if (!tabAdUnits.length) {
    return Promise.resolve({
      bidResponses: {},
      rawBidResponses: {},
    })
  }

  return new Promise((resolve) => {
    function handleAuctionEnd(rawBids) {
      logger.debug(`Prebid: auction ended`)
      resolve({
        bidResponses: normalizeBidResponses(rawBids),
        rawBidResponses: rawBids,
      })
    }

    const adUnits = getAdUnits(config)

    const pbjs = getPrebidPbjs()

    pbjs.que.push(() => {
      pbjs.setConfig({
        debug: config.logLevel === 'debug',
        // bidderTimeout: 700 // default
        publisherDomain: config.publisher.domain, // Used for SafeFrame creative
        // Overrides the page URL adapters should use. Otherwise, some adapters
        // will use the current frame's URL while others use the top frame URL.
        // Only some adapters use this setting as of May 2018.
        // https://github.com/prebid/Prebid.js/issues/1882
        pageUrl: config.publisher.pageUrl,
        // GDPR consent.
        // http://prebid.org/dev-docs/modules/consentManagement.html
        ...(config.consent.enabled && {
          consentManagement: {
            gdpr: {
              cmpApi: 'iab',
              timeout: config.consent.timeout,
              // If the CMP does not respond in time, gdprApplies
              // is false.
              defaultGdprScope: false,
            },
            usp: {
              cmpApi: 'iab',
              timeout: config.consent.timeout,
            },
          },
        }),
      })

      pbjs.addAdUnits(adUnits)
      pbjs.requestBids({
        bidsBackHandler: handleAuctionEnd,
      })
    })
  })
}

const setTargeting = () => {
  const pbjs = getPrebidPbjs()
  pbjs.setTargetingForGPTAsync()
  logger.debug(`Prebid: set ad server targeting`)
}

const PrebidBidder = Bidder({
  name,
  fetchBids,
  setTargeting,
})

export default PrebidBidder
