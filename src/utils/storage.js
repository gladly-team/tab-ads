/* eslint-disable import/prefer-default-export */

const defaultAdDataStore = {
  // Bid objects returned from apstag
  // Key: slot ID
  // Value: bid object
  amazonBids: {},

  // Bids returned from Index Exchange.
  // Key: slot element ID
  // Value: bid object
  indexExchangeBids: {
    // Whether the bids were returned in time to be part
    // of the request to our ad server.
    includedInAdServerRequest: false,
  },

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
    //     'div-gpt-abc-123': {
    //       // Standardized structure across bidders.
    //     },
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
}

// TODO: stop using window variable.
window.tabAds = {}
window.tabAds.adDataStore = { ...defaultAdDataStore }
// export const adDataStore = window.tabAds.adDataStore // eslint-disable-line prefer-destructuring

export const clearAdDataStore = () => {
  window.tabAds.adDataStore = { ...defaultAdDataStore }
}

export const getAdDataStore = () => {
  return window.tabAds.adDataStore
}
