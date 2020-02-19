/* eslint-env jest */

/**
 * Create a mock object of the googletag 'SlotRenderEnded' event. See:
 * https://developers.google.com/doubleclick-gpt/reference#googletag.events.SlotRenderEndedEvent
 * @param {string} slotId - A custom slot ID to override the default
 * @param {string} adUnitCode - A custom ad unit code to override the default
 * @param {Object} properties - Values to override the default properties in the mock
 * @return {Object}
 */
export const mockGoogleTagSlotRenderEndedData = (
  slotId = 'abc-123',
  adUnitCode = '/123456/some-ad/',
  properties = {}
) => {
  return {
    // https://developers.google.com/doubleclick-gpt/reference#googletagslot
    slot: {
      getSlotElementId: () => slotId,
      getAdUnitPath: () => adUnitCode,
      // ... other methods here
    },
    advertiserId: 1234,
    campaignId: 99887766,
    creativeId: 111222333444555,
    isEmpty: false,
    lineItemId: 123456,
    serviceName: 'something',
    size: '728x90',
    sourceAgnosticCreativeId: null,
    sourceAgnosticLineItemId: null,
    ...properties,
  }
}

/**
 * Create a mock object of the googletag 'ImpressionViewable' event. See:
 * https://developers.google.com/doubleclick-gpt/reference#googletageventsimpressionviewableevent
 * @param {string} slotId - A custom slot ID to override the default
 * @param {Object} properties - Values to override the default properties in the mock
 * @return {Object}
 */
export const mockGoogleTagImpressionViewableData = (
  slotId = 'abc-123',
  properties = {}
) => {
  return {
    // https://developers.google.com/doubleclick-gpt/reference#googletagslot
    slot: {
      getSlotElementId: () => slotId,
      // ... other methods here
    },
    serviceName: 'something',
    ...properties,
  }
}

/**
 * Create a mock object of the googletag 'SlotOnload' event. See:
 * https://developers.google.com/doubleclick-gpt/reference#googletageventsslotonloadevent
 * @param {string} slotId - A custom slot ID to override the default
 * @param {Object} properties - Values to override the default properties in the mock
 * @return {Object}
 */
export const mockGoogleTagSlotOnloadData = (
  slotId = 'abc-123',
  properties = {}
) => {
  return {
    // https://developers.google.com/doubleclick-gpt/reference#googletagslot
    slot: {
      getSlotElementId: () => slotId,
      // ... other methods here
    },
    serviceName: 'something',
    ...properties,
  }
}

/**
 * Create a mock bid response from Amazon's apstag.
 * @param {Object} properties - Values to override the default properties in the mock
 * @return {Object}
 */
export const mockAmazonBidResponse = (properties = {}) => {
  return {
    amznbid: '1',
    amzniid: 'some-id',
    amznp: '1',
    amznsz: '0x0',
    size: '0x0',
    slotID: 'div-gpt-ad-123456789-0',
    ...properties,
  }
}

/**
 * Create a mock bid response from Index Exchange.
 * @return {Object}
 */
export const mockIndexExchangeBidResponse = () => {
  return {
    slot: {
      'd-1-728x90-atf-bottom-leaderboard': [
        {
          targeting: {
            IOM: ['728x90_5000'],
            ix_id: ['_mBnLnF5V'],
          },
          price: 7000,
          adm: '',
          size: [728, 90],
          partnerId: 'IndexExchangeHtb',
        },
      ],
      'd-2-300x250-atf-middle-right_rectangle': [
        {
          targeting: {
            // Apparently, targeting values might be arrays or just keys
            some_key: 'my-cool-value123',
            ad_thing: 'thingy_abc',
          },
          price: 5000,
          adm: '_admcodehere_',
          size: [300, 250],
          partnerId: 'SomePartner',
        },
      ],
      'd-3-300x250-atf-bottom-right_rectangle': [
        {
          targeting: {
            IOM: ['300x250_5000'],
            ix_id: ['_C7VB5HUd'],
          },
          price: 3500,
          adm: '_admcodehere_',
          size: [300, 250],
          partnerId: 'IndexExchangeHtb',
        },
      ],
    },
    page: [],
    identity: {
      AdserverOrgIp: {
        data: {
          source: 'adserver.org',
          uids: [
            {
              id: '233aed36-ea6a-4a2d-aac0-d948e2a7db65',
              ext: {
                rtiPartner: 'TDID',
              },
            },
            {
              id: 'TRUE',
              ext: {
                rtiPartner: 'TDID_LOOKUP',
              },
            },
            {
              id: '2019-02-28T04:53:55',
              ext: {
                rtiPartner: 'TDID_CREATED_AT',
              },
            },
          ],
        },
      },
    },
  }
}

/**
 * Mock a response from window.fetch.
 * @return {Promise<Object>}
 */
export const mockFetchResponse = overrides => ({
  body: {},
  bodyUsed: true,
  headers: {},
  json: () => Promise.resolve({}),
  ok: true,
  redirected: false,
  status: 200,
  statusText: '',
  type: 'cors',
  url: 'https://example.com/foo/',
  ...overrides,
})

const mockPrebidBid = () => {
  return {
    bidderCode: 'openx',
    width: '728',
    height: '90',
    statusMessage: 'Bid available',
    adId: 'abc123def456',
    mediaType: 'banner',
    source: 'client',
    cpm: 0.582,
    creativeId: '209895498',
    ad: "<div id='some-ad'></div>",
    ttl: 300,
    netRevenue: true,
    currency: 'USD',
    ts: 'some-stuff-here',
    auctionId: 'a8f917ab-5d08-4dd3-93d7-44b1ec0af9c2',
    responseTimestamp: 1582143201583,
    requestTimestamp: 1582143201380,
    bidder: 'openx',
    adUnitCode: 'div-gpt-ad-123456789-0',
    timeToRespond: 203,
    pbLg: '0.50',
    pbMg: '0.50',
    pbHg: '0.58',
    pbAg: '0.55',
    pbDg: '0.58',
    pbCg: '',
    size: '728x90',
    adserverTargeting: {
      hb_bidder: 'openx',
      hb_adid: 'abc123def456',
      hb_pb: '0.50',
      hb_size: '728x90',
      hb_source: 'client',
      hb_format: 'banner',
    },
  }
}

export const mockPrebidBidResponses = () => {
  const mockBid = mockPrebidBid()
  return {
    // The long leaderboard ad.
    'div-gpt-ad-1464385677836-0': {
      bids: [
        {
          ...mockBid,
          cpm: 0.582,
          bidder: 'openx',
          bidderCode: 'openx',
          width: '728',
          height: '728',
          size: '728x90',
          adserverTargeting: {
            ...mockBid.adserverTargeting,
            hb_bidder: 'openx',
          },
        },
      ],
    },
    // The primary rectangle ad (bottom-right).
    'div-gpt-ad-1464385742501-0': {
      bids: [],
    },
    // The second rectangle ad (right side, above the first).
    'div-gpt-ad-1539903223131-0': {
      bids: [],
    },
  }
}
