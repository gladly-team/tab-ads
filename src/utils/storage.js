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

  // Marking which slots have had their revenue logged.
  // Key: slot ID
  // Value: `true`
  slotsAlreadyLoggedRevenue: {},
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
