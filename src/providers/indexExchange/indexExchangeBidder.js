import getIndexExchangeTag from 'src/providers/indexExchange/getIndexExchangeTag'
import Bidder from 'src/utils/Bidder'
// import BidResponse from 'src/utils/BidResponse'
import getGoogleTag from 'src/google/getGoogleTag'
import logger from 'src/utils/logger'
import { getAdDataStore } from 'src/utils/storage'

const indexExchangeBidderName = 'indexExchange'

// FIXME: correct return value
// TODO: assumes we are showing all 3 ads. Make that configurable.
/**
 * Return a promise that resolves when the Index Exchange bid
 * responses return or the request times out. See:
 * https://kb.indexexchange.com/Wrapper/Installation/Universal_Library_Implementation.htm
 * @return {Promise<undefined>} Resolves when the Amazon
 *   bid requests return or time out.
 */
const fetchBids = async config => {
  // Note: use ixTag.cmd.push because the JS may not have
  // loaded. Index Exchange hasn't documented the cmd
  // behavior so it may break.
  const ixTag = getIndexExchangeTag()

  const {
    leaderboard,
    rectangleAdPrimary,
    rectangleAdSecondary,
  } = config.newTabAds

  // Key = the GAM ad unit; value = the Index Exchange ID
  const mapGAMSlotsToIXSlots = {
    // Bottom leaderboard
    [leaderboard.adUnitId]: 'd-1-728x90-atf-bottom-leaderboard',
    // Bottom-right rectangle ad
    [rectangleAdPrimary.adUnitId]: 'd-3-300x250-atf-bottom-right_rectangle',
    // Second (upper) rectangle ad
    [rectangleAdSecondary.adUnitId]: 'd-2-300x250-atf-middle-right_rectangle',
  }

  // TODO
  // Only get bids for the number of ads we'll show.
  const IXSlots = [
    { htSlotName: mapGAMSlotsToIXSlots[leaderboard.adUnitId] },
    { htSlotName: mapGAMSlotsToIXSlots[rectangleAdPrimary.adUnitId] },
    {
      htSlotName: mapGAMSlotsToIXSlots[rectangleAdSecondary.adUnitId],
    },
  ]

  return new Promise(resolve => {
    function handleAuctionEnd() {
      logger.debug(`Index Exchange: auction ended`)
      resolve()
    }

    // Note that Index Exchange hasn't documented the cmd
    // behavior so it may break.
    ixTag.cmd.push(() => {
      // console.log('Index Exchange: retrieving demand')

      // IX appears to reinitialize the variable on load.
      const ixTagAgain = getIndexExchangeTag()

      logger.debug(`Index Exchange: bids requested`)

      // Fetch bid responses from Index Exchange.
      // Note: the current request is to a casalemedia URL.
      ixTagAgain.retrieveDemand(IXSlots, demand => {
        // TODO: move to setTargeting

        // Set adserver targeting for any returned demand.
        // IX demand should set the IOM and ix_id parameters.
        try {
          if (demand && demand.slot) {
            const googletag = getGoogleTag()

            // Loop through defined GAM slots to set any targeting.
            googletag.cmd.push(() => {
              googletag
                .pubads()
                .getSlots()
                .forEach(googleSlot => {
                  const IXSlotName =
                    mapGAMSlotsToIXSlots[googleSlot.getAdUnitPath()]
                  if (!IXSlotName) {
                    // No Index Exchange unit for this Google slot.
                    return
                  }
                  const IXBidResponseArray = demand.slot[IXSlotName]
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
                    Object.keys(IXBidResponse.targeting).forEach(
                      targetingKey => {
                        // https://developers.google.com/doubleclick-gpt/reference#googletag.Slot_setTargeting
                        googleSlot.setTargeting(
                          targetingKey,
                          IXBidResponse.targeting[targetingKey]
                        )
                      }
                    )
                  })
                })
            })
          }
        } catch (e) {
          logger.error(e)
        }
        handleAuctionEnd()
      })
    })

    // Resolve after some time to avoid waiting too long
    // for responses.
    setTimeout(() => {
      handleAuctionEnd()
    }, config.bidderTimeout)
  })
}

const setTargeting = () => {
  // TODO
  logger.debug(`Index Exchange: set ad server targeting`)
}

const AmazonBidder = Bidder({
  name: indexExchangeBidderName,
  fetchBids,
  setTargeting,
})

export default AmazonBidder
