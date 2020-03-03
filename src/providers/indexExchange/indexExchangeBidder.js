import { get } from 'lodash/object'
import getIndexExchangeTag from 'src/providers/indexExchange/getIndexExchangeTag'
import Bidder from 'src/utils/Bidder'
import BidResponse from 'src/utils/BidResponse'
import getGoogleTag from 'src/google/getGoogleTag'
import logger from 'src/utils/logger'

const indexExchangeBidderName = 'indexExchange'

// Stored for use in `setTargeting`.
let ixRawBidResponses
let tabConfig

const leaderboardIXSlotID = 'd-1-728x90-atf-bottom-leaderboard'
const rectangleAdPrimaryIXSlotID = 'd-3-300x250-atf-bottom-right_rectangle'
const rectangleAdSecondaryIXSlotID = 'd-2-300x250-atf-middle-right_rectangle'

// GAMSlotId is the Google ad unit ID.
const mapGAMSlotToIXSlot = GAMSlotId => {
  const {
    leaderboard,
    rectangleAdPrimary,
    rectangleAdSecondary,
  } = tabConfig.newTabAds

  // Key = the GAM ad unit; value = the Index Exchange ID
  const map = {
    // Leaderboard ad
    [leaderboard.adUnitId]: leaderboardIXSlotID,
    // Bottom-right rectangle ad
    [rectangleAdPrimary.adUnitId]: rectangleAdPrimaryIXSlotID,
    // Second (upper) rectangle ad
    [rectangleAdSecondary.adUnitId]: rectangleAdSecondaryIXSlotID,
  }
  return map[GAMSlotId]
}

// IXSlotId is the Index Exchange slot ID.
const mapIXSlotToAdId = IXSlotId => {
  const {
    leaderboard,
    rectangleAdPrimary,
    rectangleAdSecondary,
  } = tabConfig.newTabAds

  // Key = the Index Exchange ID; value = the GAM ad ID
  const map = {
    // Leaderboard ad
    [leaderboardIXSlotID]: leaderboard.adId,
    // Bottom-right rectangle ad
    [rectangleAdPrimaryIXSlotID]: rectangleAdPrimary.adId,
    // Second (upper) rectangle ad
    [rectangleAdSecondaryIXSlotID]: rectangleAdSecondary.adId,
  }
  return map[IXSlotId]
}

/**
 * Given IX bid responses, return an object with keys set to adIds
 * and values set to an array of BidResponses for that adId.
 * @param {Array} rawBidData - IX's bid response
 * @return {Object} bidResponses - An object with keys equal to each adId
 *   for which there's a bid and values with an array of BidResponses, the
 *   bidder's normalized bids for that ad.
 */
const normalizeBidResponses = (rawBidData = []) => {
  const normalizeBid = (adId, rawBid) => {
    return BidResponse({
      adId,
      // Index Exchange’s returned "price" field is a CPM in cents, so
      // 265 = $2.65 CPM. Convert to impression revenue.
      revenue: rawBid.price / 10e4,
      advertiserName: indexExchangeBidderName,
      adSize: `${rawBid.size[0]}x${rawBid.size[1]}`,
    })
  }
  const IXBidsBySlot = get(rawBidData, 'slot', {})
  const normalizedBids = Object.keys(IXBidsBySlot).reduce(
    (accumulator, IXSlotId) => {
      const IXBidsForThisSlot = get(IXBidsBySlot, IXSlotId, [])
      const adId = mapIXSlotToAdId(IXSlotId)

      // This will happen if IX returns some unexpected slot ID.
      if (!adId) {
        return accumulator
      }
      return {
        ...accumulator,
        [adId]: IXBidsForThisSlot.map(IXBid => normalizeBid(adId, IXBid)),
      }
    },
    {}
  )
  return normalizedBids
}

// Index Exchange sometimes calls the retrieveDemand more than once.
// Keep track of requests so we only handle the first one. Note that
// we'll have to refactor this if we ever call for bids more than once
// per page load.
let bidsReturned = false

/**
 * Return a promise that resolves when the Index Exchange bid
 * responses return or the request times out. See:
 * https://kb.indexexchange.com/Wrapper/Installation/Universal_Library_Implementation.htm
 * @return {Promise<undefined>} Resolves when the bid requests return
 *   or time out.
 */
const fetchBids = async config => {
  bidsReturned = false

  // Note: use ixTag.cmd.push because the JS may not have
  // loaded. Index Exchange hasn't documented the cmd
  // behavior so it may break.
  const ixTag = getIndexExchangeTag()
  tabConfig = config
  const { adUnits } = config
  if (!adUnits.length) {
    return Promise.resolve({
      bidResponses: {},
      rawBidResponses: {},
    })
  }

  const IXSlots = adUnits.map(adUnit => {
    return { htSlotName: mapGAMSlotToIXSlot(adUnit.adUnitId) }
  })

  return new Promise(resolve => {
    let timeoutId
    function handleAuctionEnd(rawBidResponses) {
      logger.debug(`IndexExchange: auction ended`)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      resolve({
        bidResponses: normalizeBidResponses(rawBidResponses),
        rawBidResponses,
      })
    }

    // Note that Index Exchange hasn't documented the cmd
    // behavior so it may break.
    ixTag.cmd.push(() => {
      // IX appears to reinitialize the variable on load.
      const ixTagAgain = getIndexExchangeTag()

      logger.debug(`IndexExchange: bids requested`)

      // Fetch bid responses from Index Exchange.
      // Note: the current request is to a casalemedia URL.
      ixTagAgain.retrieveDemand(IXSlots, rawBidResponses => {
        if (bidsReturned) {
          // Ignore any responses except the first.
          return
        }
        bidsReturned = true
        ixRawBidResponses = rawBidResponses
        handleAuctionEnd(rawBidResponses)
      })
    })

    // Resolve after some time to avoid waiting too long
    // for responses.
    timeoutId = setTimeout(() => {
      handleAuctionEnd()
    }, config.bidderTimeout)
  })
}

const setTargeting = () => {
  // Set adserver targeting for any returned demand.
  // IX demand should set the IOM and ix_id parameters.
  try {
    if (ixRawBidResponses && ixRawBidResponses.slot) {
      const googletag = getGoogleTag()

      // Loop through defined GAM slots to set any targeting.
      googletag.cmd.push(() => {
        googletag
          .pubads()
          .getSlots()
          .forEach(googleSlot => {
            const IXSlotName = mapGAMSlotToIXSlot(googleSlot.getAdUnitPath())
            if (!IXSlotName) {
              // No Index Exchange unit for this Google slot.
              return
            }
            const IXBidResponseArray = ixRawBidResponses.slot[IXSlotName]
            if (!IXBidResponseArray || !IXBidResponseArray.length) {
              // No Index Exchange bid for this ad unit.
              return
            }
            IXBidResponseArray.forEach(IXBidResponse => {
              if (!IXBidResponse.targeting) {
                // No IX targeting provided.
                return
              }
              // Set IX targeting on this slot.
              Object.keys(IXBidResponse.targeting).forEach(targetingKey => {
                // https://developers.google.com/doubleclick-gpt/reference#googletag.Slot_setTargeting
                googleSlot.setTargeting(
                  targetingKey,
                  IXBidResponse.targeting[targetingKey]
                )
              })
            })
          })
      })
    }
  } catch (e) {
    logger.error(e)
  }

  logger.debug(`IndexExchange: set ad server targeting`)
}

const IndexExchangeBidder = Bidder({
  name: indexExchangeBidderName,
  fetchBids,
  setTargeting,
})

export default IndexExchangeBidder
