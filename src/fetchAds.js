import { get, set } from 'lodash/object'

// Ad server.
import getGoogleTag from 'src/google/getGoogleTag'
import setUpGoogleAds from 'src/google/setUpGoogleAds'
import { setUpAdDisplayListeners } from 'src/adDisplayListeners'

// Other helpers.
import bidders from 'src/bidders'
import logger from 'src/utils/logger'
import { setConfig } from 'src/config'
import { getAdDataStore } from 'src/utils/storage'

// Set to true if we send a request to the ad server.
let adserverRequestSent = false

// If we ever make more than one fetch for ads on any page load,
// either make this more functional or remove module state entirely.
export const reset = () => {
  adserverRequestSent = false
}

/**
 * Add bidder targeting to googletag and send a request
 * to Google Ad Manager to fetch ads.
 * @return {undefined}
 */
function sendAdserverRequest() {
  // Return if the request to the adserver was already sent.
  if (adserverRequestSent === true) {
    return
  }
  adserverRequestSent = true

  logger.debug(`Ending auction.`)

  // Set targeting and make a request to GAM.
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    // Set ad server targeting.
    bidders.forEach(bidder => {
      bidder.setTargeting()
    })

    // Fetch ads.
    googletag.pubads().refresh()

    logger.debug(`Sent request to ad server.`)

    // Mark which bidders returned bids in time to be included
    // in the ad server request.
    bidders.forEach(bidder => {
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

  try {
    await Promise.all(
      bidders.map(async bidder => {
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

    // If fetchBids returned for all the bidders, we can
    // call the ad server (if we haven't already).
    sendAdserverRequest()
  } catch (e) {
    logger.error(e)
  }
}

const fetchAds = async userConfig => {
  const config = setConfig(userConfig)
  try {
    if (!config.disableAds) {
      const { adUnits } = config
      if (!adUnits.length) {
        logger.debug(
          'No ad units provided. Not setting up GAM or fetching bids.'
        )
        return
      }

      // Define slots and enable ad services.
      setUpGoogleAds(config)

      // Track loaded ads for analytics.
      setUpAdDisplayListeners()

      // Call the ad server after some time to avoid waiting
      // too long for bid responses.
      setTimeout(() => {
        sendAdserverRequest()
      }, config.auctionTimeout)

      callBidders(config)
    } else {
      logger.debug('Ads are disabled. Not setting up GAM or fetching bids.')
    }
  } catch (e) {
    logger.error(e)
  }
}

export default fetchAds
