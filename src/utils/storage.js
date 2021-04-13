/* eslint-disable import/prefer-default-export */
import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

const getDefaultAdDataStore = () => ({
  // Storing data from Google's ad slot events.
  adManager: {
    // Objects from googletag's "slotRenderEnded" event. This event fires
    // before the "slotOnload" event; i.e., before the actual creative loads.
    // Key: slot ID
    // Value: https://developers.google.com/doubleclick-gpt/reference#googletageventsslotrenderendedevent
    slotsRendered: {},

    // Marking which slots have fired googletag's "impressionViewable" event.
    // See:
    // https://developers.google.com/doubleclick-gpt/reference#googletageventsimpressionviewableevent
    // Key: slot ID
    // Value: `true`
    slotsViewable: {},

    // Marking which slots have fired googletag's "slotOnload" event;
    // i.e., which slots have loaded creative. See:
    // https://developers.google.com/doubleclick-gpt/reference#googletag.events.SlotRenderEndedEvent
    // Key: slot ID
    // Value: `true`
    slotsLoaded: {},
  },

  bidResponses: {
    // // E.g.:
    // amazon: {
    //   // Bid response for each slot, standardized.
    //   bidResponses: {
    //     'div-gpt-abc-123': [
    //       {} // BidResponse
    //     ],
    //   },
    //   // true if the bidder responded in time to be included in the auction.
    //   includedInAdRequest: false,
    //   // Raw response data for each slot from the ad partner.
    //   rawBidResponses: {
    //     'div-gpt-abc-123': {
    //       bid: 'data'
    //     }
    //   }
    // },
  },
})

global.tabAds = global.tabAds || {}
global.tabAds.adDataStore = global.tabAds.adDataStore || getDefaultAdDataStore()

export const clearAdDataStore = () => {
  global.tabAds.adDataStore = getDefaultAdDataStore()
}

export const getAdDataStore = () => global.tabAds.adDataStore
