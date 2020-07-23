import { get, set } from 'lodash/object'
import getGoogleTag from 'src/google/getGoogleTag'
import logger from 'src/utils/logger'
import { getAdDataStore } from 'src/utils/storage'
import { getWinningBidForAd } from 'src/utils/getWinningBids'

const adDisplayCallbacks = {
  // key = adId; value: { onAdRendered: [() => {}] }
}

/**
 * Calls all callbacks registered for the "ad render" event for the ad
 * with ID `adId`.
 * @param {String} adId - An ad ID.
 * @return {undefined}
 */
const callAdRenderedCallbacks = (adId) => {
  const winningBid = getWinningBidForAd(adId)
  const callbacks = get(adDisplayCallbacks, [adId, 'onAdRendered'], [])
  callbacks.forEach((cb) => {
    cb(winningBid)
  })
}

/**
 * Register a callback for when an ad with ID `adId` is rendered.
 * @param {String} adId - An ad ID.
 * @param {Function} callback - The function to call when the ad renders.
 * @return {undefined}
 */
export const onAdRendered = (adId, callback) => {
  logger.debug(`Listening for ad render for ${adId}.`)

  // Store the callback.
  const callbacksStore = get(adDisplayCallbacks, [adId, 'onAdRendered'], [])
  set(adDisplayCallbacks, [adId, 'onAdRendered'], [...callbacksStore, callback])

  // If the ad has already rendered, immediately call the callback.
  const adDataStore = getAdDataStore()
  const adAlreadyLoaded = !!get(adDataStore, [
    'adManager',
    'slotsRendered',
    adId,
  ])
  if (adAlreadyLoaded) {
    callAdRenderedCallbacks(adId)
  }
}

/**
 * Listen for various ad load and display events and store them.
 * @return {undefined}
 */
export const setUpAdDisplayListeners = () => {
  try {
    const googletag = getGoogleTag()
    const adDataStore = getAdDataStore()
    googletag.cmd.push(() => {
      // 'slotRenderEnded' event is at end of slot (iframe) render but before
      // the ad creative loads:
      // https://developers.google.com/doubleclick-gpt/reference#googletageventsslotrenderendedevent
      // 'impressionViewable' event is when the ad is mostly within view
      // for one second:
      // https://developers.google.com/doubleclick-gpt/reference#googletageventsimpressionviewableevent
      // 'slotOnload' event is on creative load:
      // https://developers.google.com/doubleclick-gpt/reference#googletag.events.SlotRenderEndedEvent

      // Keep track of data for rendered slots
      googletag.pubads().addEventListener('slotRenderEnded', (event) => {
        try {
          const slotId = event.slot.getSlotElementId()

          // Store the rendered slot data.
          adDataStore.adManager.slotsRendered[slotId] = event

          // Call any callbacks.
          callAdRenderedCallbacks(slotId)
        } catch (e) {
          logger.error(e)
        }
      })

      // Keep track of which slots have become viewable
      googletag.pubads().addEventListener('impressionViewable', (event) => {
        try {
          const slotId = event.slot.getSlotElementId()

          // Mark the slot as viewable.
          adDataStore.adManager.slotsViewable[slotId] = true
        } catch (e) {
          logger.error(e)
        }
      })

      // Keep track of which slots have actually loaded creative
      googletag.pubads().addEventListener('slotOnload', (event) => {
        try {
          const slotId = event.slot.getSlotElementId()

          // Makr the slot as loaded.
          adDataStore.adManager.slotsLoaded[slotId] = true
        } catch (e) {
          logger.error(e)
        }
      })
    })
  } catch (e) {
    logger.error(e)
  }
}
