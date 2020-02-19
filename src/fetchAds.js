import { get, set } from 'lodash/object'

// Ad server.
import getGoogleTag from 'src/google/getGoogleTag'
import setUpGoogleAds from 'src/google/setUpGoogleAds'
import handleAdsLoaded from 'src/handleAdsLoaded'

// Bidders.
import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'
import indexExchangeBidder from 'src/providers/indexExchange/indexExchangeBidder'

// Other helpers.
import logger from 'src/utils/logger'
import { setConfig } from 'src/config'
import { getAdDataStore } from 'src/utils/storage'

const BIDDERS = [prebidBidder, amazonBidder, indexExchangeBidder]

// Set to true if we send a request to the ad server.
let adserverRequestSent = false

/**
 * Add bidder targeting to googletag and send a request
 * to DFP to fetch ads.
 * @return {undefined}
 */
function sendAdserverRequest() {
  // Return if the request to the adserver was already sent.
  if (adserverRequestSent === true) {
    return
  }
  adserverRequestSent = true

  logger.debug(`Sending request to ad server.`)

  // Set targeting and make a request to DFP.
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    // Set ad server targeting.
    // TODO: add tests
    BIDDERS.forEach(bidder => {
      bidder.setTargeting()
    })

    // Fetch ads.
    googletag.pubads().refresh()

    // TODO: add tests
    // Mark which bidders returned bids in time to be included
    // in the ad server request.
    BIDDERS.forEach(bidder => {
      const store = getAdDataStore()

      // This is true if the bidder has returned bid responses.
      const bidsIncluded = !!get(
        store,
        ['bidResponses', bidder.name, 'bidResponses'],
        null
      )
      if (bidsIncluded) {
        set(store, ['bidResponses', bidder.name, 'includedInAdRequest'], true)
      }
    })
  })
}

/**
 * Initialize all bidders and make bid requests.
 * @return {undefined}
 */
const callBidders = async config => {
  logger.debug(`Loading all bidders in ads.js.`)

  // TODO: add tests
  // TODO: handle errors gracefully (need parent app to log them)
  try {
    await Promise.all(
      BIDDERS.map(async bidder => {
        try {
          const bidResponseData = await bidder.fetchBids(config)
          const store = getAdDataStore()
          store.bidResponses[bidder.name] = {
            ...bidResponseData,
            // We set this to true during the ad server request if
            // the bids returned in time.
            includedInAdRequest: false,
          }
          return bidResponseData
        } catch (e) {
          logger.error(e)
          return null
        }
      })
    )
  } catch (e) {
    logger.error(e)
  }

  // TODO: add test
  // If fetchBids returned for all the bidders, we can
  // call the ad server (if we haven't already).
  sendAdserverRequest()
}

const fetchAds = async userConfig => {
  const config = setConfig(userConfig)
  if (!config.disableAds) {
    // Define slots and enable ad services.
    setUpGoogleAds(config)

    // Track loaded ads for analytics
    handleAdsLoaded()

    // Call the ad server after some time to avoid waiting
    // too long for bid responses.
    setTimeout(() => {
      sendAdserverRequest()
    }, config.auctionTimeout)

    callBidders(config)
  } else {
    logger.debug('Ads are disabled. Not setting up DFP or fetching bids.')
  }
}

export default fetchAds
