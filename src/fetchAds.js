import { get, set } from 'lodash/object'
import indexExchangeBidder, {
  markIndexExchangeBidsAsIncluded,
} from 'src/providers/indexExchange/indexExchangeBidder'

// Ad server
import getGoogleTag from 'src/google/getGoogleTag'
import setUpGoogleAds from 'src/google/setUpGoogleAds'
import handleAdsLoaded from 'src/handleAdsLoaded'

// Bidders
import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'

import logger from 'src/utils/logger'
import { setConfig } from 'src/config'
import { getAdDataStore } from 'src/utils/storage'

// TODO: use this for all bidders
const BIDDERS = [prebidBidder, amazonBidder]

// TODO: remove
// Enabled bidders.
const BIDDER_IX = 'ix'

const bidders = [BIDDER_IX]

// Keep track of which bidders have responded.
const requestManager = {
  // [bidder name]: {boolean} whether the bidder has
  //   returned a bid
  bidders: bidders.reduce((bidderTracker, currentBidder) => {
    bidderTracker[currentBidder] = false // eslint-disable-line no-param-reassign
    return bidders
  }, {}),

  // Whether we've already requested ads from the ad
  // server.
  adserverRequestSent: false,
}

/**
 * Add bidder targeting to googletag and send a request
 * to DFP to fetch ads.
 * @return {undefined}
 */
function sendAdserverRequest() {
  // Return if the request to the adserver was already sent.
  if (requestManager.adserverRequestSent === true) {
    return
  }
  requestManager.adserverRequestSent = true

  // For revenue analytics.
  if (requestManager.bidders[BIDDER_IX]) {
    markIndexExchangeBidsAsIncluded()
  }

  logger.debug(`Sending request to ad server.`)

  // Set targeting and make a request to DFP.
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    // Set ad server targeting.
    // TODO: move all bidders into this
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
 * Whether all bidders have returned bids.
 * @return {boolean}
 */
function allBiddersBack() {
  return (
    // If length is equal to bidders, all bidders are back.
    bidders
      .map(bidder => {
        return requestManager.bidders[bidder]
      })
      // Remove false values (bidders that have not responded).
      .filter(Boolean).length === bidders.length
  )
}

/**
 * Mark a bidder as having returned bids. If all bidders have
 * returned bids, call the ad server.
 * @return {undefined}
 */
function bidderCompleted(bidder) {
  // Return if the request to the adserver was already sent.
  if (requestManager.adserverRequestSent === true) {
    return
  }
  requestManager.bidders[bidder] = true
  if (allBiddersBack()) {
    sendAdserverRequest()
  }
}

/**
 * Initialize all bidders and make bid requests.
 * @return {undefined}
 */
const callBidders = async config => {
  // Track loaded ads for analytics
  handleAdsLoaded()

  logger.debug(`Loading all bidders in ads.js.`)

  // TODO: standardize bidder API.

  // Index Exchange
  indexExchangeBidder(config)
    .then(() => {
      bidderCompleted(BIDDER_IX)
    })
    .catch(err => {
      logger.error(err)
      bidderCompleted(BIDDER_IX)
    })

  // TODO: move all bidders into this
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
