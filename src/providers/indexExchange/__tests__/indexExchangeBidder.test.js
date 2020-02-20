/* eslint-env jest */

import { setConfig } from 'src/config'

jest.mock('src/providers/indexExchange/getIndexExchangeTag')
jest.mock('src/google/getGoogleTag')
jest.mock('src/utils/logger')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  // Mock the IX tag
  delete window.headertag
  const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
    .default
  window.headertag = getIndexExchangeTag()

  // Set up googletag
  delete window.googletag
  const getGoogleTag = require('src/google/getGoogleTag').default
  window.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete window.headertag
  delete window.googletag
})

describe('indexExchangeBidder: fetchBids', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
  })

  it('gets bids for the three ads', async () => {
    expect.assertions(2)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
      { htSlotName: 'd-3-300x250-atf-bottom-right_rectangle' },
      { htSlotName: 'd-2-300x250-atf-middle-right_rectangle' },
    ])
  })

  // eslint-disable-next-line jest/expect-expect
  it('the bidder resolves when the bid response returns', () => {
    return new Promise(done => {
      const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
        .default
      const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
        .default
      const ixTag = getIndexExchangeTag()

      let retrieveDemandCallback
      ixTag.retrieveDemand.mockImplementation((config, callback) => {
        retrieveDemandCallback = callback
      })
      const tabAdsConfig = setConfig()
      indexExchangeBidder.fetchBids(tabAdsConfig).then(() => {
        done()
      })
      retrieveDemandCallback()
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('the bidder resolves when we pass the bidder timeout', () => {
    return new Promise(done => {
      const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
        .default
      const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
        .default
      const ixTag = getIndexExchangeTag()

      // Mock that retrieveDemand never calls the callback.
      ixTag.retrieveDemand.mockImplementation(() => {})
      const tabAdsConfig = setConfig()
      indexExchangeBidder.fetchBids(tabAdsConfig).then(() => {
        done()
      })

      // Here, bidder timeout is 700ms.
      jest.advanceTimersByTime(701)
    })
  })

  it('does not throw or log an error if the bid response is undefined', async () => {
    expect.assertions(4)
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(undefined)
    )
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if the bid response is an empty object', async () => {
    expect.assertions(4)
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) => callback({}))
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if the bid response has no slot responses', async () => {
    expect.assertions(4)
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback({
        slot: {},
        page: [],
        identity: {},
      })
    )
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX returns an unexpected slot ID', async () => {
    expect.assertions(4)
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback({
        slot: {
          'this-slot-does-not-exist-for-us': [
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
        },
        page: [],
        identity: {},
      })
    )
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX does not define targeting values for a slot', async () => {
    expect.assertions(4)
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback({
        slot: {
          'd-1-728x90-atf-bottom-leaderboard': [
            {
              targeting: {},
              price: 7000,
              adm: '',
              size: [728, 90],
              partnerId: 'IndexExchangeHtb',
            },
          ],
        },
        page: [],
        identity: {},
      })
    )
    const tabAdsConfig = setConfig()
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('returns the expected IX bid responses in the rawBidResponses key', async () => {
    expect.assertions(1)

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('src/utils/test-utils')
    const mockBidResponse = mockIndexExchangeBidResponse()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    const tabAdsConfig = setConfig()
    const { rawBidResponses } = await indexExchangeBidder.fetchBids(
      tabAdsConfig
    )
    expect(rawBidResponses).toEqual(mockBidResponse)
  })

  it('returns the expected normalized BidResponses in the bidResponses key', async () => {
    expect.assertions(1)

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('src/utils/test-utils')
    const mockBidResponse = mockIndexExchangeBidResponse()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    const tabAdsConfig = setConfig()
    const { bidResponses } = await indexExchangeBidder.fetchBids(tabAdsConfig)
    const expectedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          revenue: 120 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '728x90',
          encodedRevenue: null,
          DFPAdvertiserId: null,
        },
      ],
      // The primary rectangle ad (bottom-right).
      'div-gpt-ad-1464385742501-0': [
        {
          revenue: 3500 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '300x250',
          encodedRevenue: null,
          DFPAdvertiserId: null,
        },
      ],
      // The second rectangle ad (right side, above the first).
      'div-gpt-ad-1539903223131-0': [
        {
          revenue: 5324 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '300x250',
          encodedRevenue: null,
          DFPAdvertiserId: null,
        },
      ],
    }
    expect(bidResponses).toEqual(expectedBidResponses)
  })
})

describe('indexExchangeBidder: setTargeting', () => {
  it('sets the expected targeting for Google Ad Manager when all slots have bids', async () => {
    expect.assertions(6)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('src/utils/test-utils')
    const mockBidResponse = mockIndexExchangeBidResponse()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    const tabAdsConfig = setConfig()

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const googleSlots = googletag.pubads().getSlots()
    const [leaderboardSlot, rectangleSlot, secondRectangleSlot] = googleSlots
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith('IOM', [
      '728x90_5000',
    ])
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith('ix_id', [
      '_mBnLnF5V',
    ])
    expect(rectangleSlot.setTargeting).toHaveBeenCalledWith('IOM', [
      '300x250_5000',
    ])
    expect(rectangleSlot.setTargeting).toHaveBeenCalledWith('ix_id', [
      '_C7VB5HUd',
    ])
    expect(secondRectangleSlot.setTargeting).toHaveBeenCalledWith(
      'ad_thing',
      'thingy_abc'
    )
    expect(secondRectangleSlot.setTargeting).toHaveBeenCalledWith(
      'some_key',
      'my-cool-value123'
    )
  })

  it('sets targeting for multiple bids on a single slot', async () => {
    expect.assertions(3)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback({
        slot: {
          'd-1-728x90-atf-bottom-leaderboard': [
            {
              targeting: {
                IOM: ['728x90_5000'],
                ix_id: ['_some_ix_id'],
              },
              price: 7000,
              adm: '',
              size: [728, 90],
              partnerId: 'IndexExchangeHtb',
            },
            {
              targeting: {
                partner_thing: ['foobar'],
              },
              price: 5000,
              adm: '',
              size: [728, 90],
              partnerId: 'AnotherPartner',
            },
          ],
        },
        page: [],
        identity: {},
      })
    )
    const tabAdsConfig = setConfig()

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const [leaderboardSlot] = googletag.pubads().getSlots()
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith('IOM', [
      '728x90_5000',
    ])
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith('ix_id', [
      '_some_ix_id',
    ])
    expect(leaderboardSlot.setTargeting).toHaveBeenCalledWith('partner_thing', [
      'foobar',
    ])
  })

  it('does not set targeting until setTargeting is called', async () => {
    expect.assertions(6)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('src/utils/test-utils')
    const mockBidResponse = mockIndexExchangeBidResponse()
    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    const tabAdsConfig = setConfig()

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // We have not yet called setTargeting.
    const googleSlots = googletag.pubads().getSlots()
    const [leaderboardSlot, rectangleSlot, secondRectangleSlot] = googleSlots
    expect(leaderboardSlot.setTargeting).not.toHaveBeenCalled()
    expect(rectangleSlot.setTargeting).not.toHaveBeenCalled()
    expect(secondRectangleSlot.setTargeting).not.toHaveBeenCalled()

    // Set targeting.
    indexExchangeBidder.setTargeting()

    expect(leaderboardSlot.setTargeting).toHaveBeenCalled()
    expect(rectangleSlot.setTargeting).toHaveBeenCalled()
    expect(secondRectangleSlot.setTargeting).toHaveBeenCalled()
  })
})

describe('indexExchangeBidder: name', () => {
  it('has the expected bidder name', () => {
    expect.assertions(1)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    expect(indexExchangeBidder.name).toEqual('indexExchange')
  })
})
