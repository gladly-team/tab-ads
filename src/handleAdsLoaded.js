import getGoogleTag from 'src/google/getGoogleTag'
import logger from 'src/utils/logger'
import { getAdDataStore } from 'src/utils/storage'

// TODO: call displayAd callbacks
// Keep track of what ad slots have loaded. When slots load, call
// the callbacks provided in displayAd.
export default () => {
  try {
    const googletag = getGoogleTag()
    const adDataStore = getAdDataStore()

    const storeRenderedSlotData = (slotId, eventData) => {
      adDataStore.adManager.slotsRendered[slotId] = eventData
    }

    const markSlotAsViewable = slotId => {
      adDataStore.adManager.slotsViewable[slotId] = true
    }

    const markSlotAsLoaded = slotId => {
      adDataStore.adManager.slotsLoaded[slotId] = true
    }

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
      googletag.pubads().addEventListener('slotRenderEnded', event => {
        try {
          const slotId = event.slot.getSlotElementId()
          storeRenderedSlotData(slotId, event)
        } catch (e) {
          logger.error(e)
        }
      })

      // Keep track of which slots have become viewable
      googletag.pubads().addEventListener('impressionViewable', event => {
        try {
          const slotId = event.slot.getSlotElementId()
          markSlotAsViewable(slotId)
        } catch (e) {
          logger.error(e)
        }
      })

      // Keep track of which slots have actually loaded creative
      googletag.pubads().addEventListener('slotOnload', event => {
        try {
          const slotId = event.slot.getSlotElementId()
          markSlotAsLoaded(slotId)
        } catch (e) {
          logger.error(e)
        }
      })
    })
  } catch (e) {
    logger.error(e)
  }
}
