/* eslint-env jest */

import { setConfig } from 'src/config'
import { getMockTabAdsUserConfig } from 'src/utils/test-utils'
import getGlobal from 'src/utils/getGlobal'

jest.mock('src/providers/indexExchange/getIndexExchangeTag')
jest.mock('src/google/getGoogleTag')
jest.mock('src/utils/logger')

const global = getGlobal()

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  // Mock the IX tag
  delete global.headertag
  const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
    .default
  global.headertag = getIndexExchangeTag()

  // Set up googletag
  delete global.googletag
  const getGoogleTag = require('src/google/getGoogleTag').default
  global.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

afterAll(() => {
  delete global.headertag
  delete global.googletag
})

describe('indexExchangeBidder: fetchBids', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)
  })

  it('gets bids for three ads when all ad units are enabled', async () => {
    expect.assertions(2)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
      { htSlotName: 'd-3-300x250-atf-bottom-right_rectangle' },
      { htSlotName: 'd-2-300x250-atf-middle-right_rectangle' },
    ])
  })

  it('does not fetch bids when no ad units are enabled', async () => {
    expect.assertions(1)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(ixTag.retrieveDemand).not.toHaveBeenCalled()
  })

  it('returns a Promise that resolves to empty bid response info when no ads are enabled', async () => {
    expect.assertions(1)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    const response = await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(response).toEqual({
      bidResponses: {},
      rawBidResponses: {},
    })
  })

  it('gets bids for one ad when one ad unit is enabled', async () => {
    expect.assertions(2)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The long leaderboard ad.
          adId: 'div-gpt-ad-1464385677836-0',
          adUnitId: '/43865596/HBTL',
          sizes: [[728, 90]],
        },
      ],
    })
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
    ])
  })

  it('gets bids for two ads when two ad units are enabled', async () => {
    expect.assertions(2)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The long leaderboard ad.
          adId: 'div-gpt-ad-1464385677836-0',
          adUnitId: '/43865596/HBTL',
          sizes: [[728, 90]],
        },
        {
          // The primary rectangle ad (bottom-right).
          adId: 'div-gpt-ad-1464385742501-0',
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
        },
      ],
    })
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    expect(ixTag.retrieveDemand).toHaveBeenCalled()
    expect(ixTag.retrieveDemand.mock.calls[0][0]).toEqual([
      { htSlotName: 'd-1-728x90-atf-bottom-leaderboard' },
      { htSlotName: 'd-3-300x250-atf-bottom-right_rectangle' },
    ])
  })

  it('calls logger.debug with info when fetching bids', async () => {
    expect.assertions(1)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)
    const logger = require('src/utils/logger').default
    expect(logger.debug).toHaveBeenCalledWith('IndexExchange: bids requested')
  })

  // eslint-disable-next-line jest/expect-expect
  it('the bidder resolves when the bid response returns', () => {
    expect.assertions(0)
    return new Promise((resolve) => {
      const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
        .default
      const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
        .default
      const ixTag = getIndexExchangeTag()

      let retrieveDemandCallback
      ixTag.retrieveDemand.mockImplementation((config, callback) => {
        retrieveDemandCallback = callback
      })
      const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
      indexExchangeBidder.fetchBids(tabAdsConfig).then(() => {
        resolve()
      })
      retrieveDemandCallback()
    })
  })

  it('calls logger.debug with info when the auction ends', () => {
    expect.assertions(1)
    return new Promise((resolve, reject) => {
      const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
        .default
      const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
        .default
      const ixTag = getIndexExchangeTag()
      const logger = require('src/utils/logger').default

      let retrieveDemandCallback
      ixTag.retrieveDemand.mockImplementation((config, callback) => {
        retrieveDemandCallback = callback
      })
      const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
      indexExchangeBidder
        .fetchBids(tabAdsConfig)
        .then(() => {
          expect(logger.debug).toHaveBeenLastCalledWith(
            'IndexExchange: auction ended'
          )
          resolve()
        })
        .catch((e) => {
          reject(e)
        })
      retrieveDemandCallback()
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('the bidder resolves when we exceed the bidder timeout', () => {
    expect.assertions(0)
    return new Promise((resolve) => {
      const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
        .default
      const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
        .default
      const ixTag = getIndexExchangeTag()

      // Mock that retrieveDemand never calls the callback.
      ixTag.retrieveDemand.mockImplementation(() => {})
      const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
      indexExchangeBidder.fetchBids(tabAdsConfig).then(() => {
        resolve()
      })

      // Here, bidder timeout is 700ms.
      jest.advanceTimersByTime(701)
    })
  })

  it('does not throw or log an error if the bid response is undefined', async () => {
    expect.assertions(4)
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if the bid response is an empty object', async () => {
    expect.assertions(4)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    ixTag.retrieveDemand.mockImplementation((config, callback) => callback({}))
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if the bid response has no slot responses', async () => {
    expect.assertions(4)
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX returns an unexpected slot ID', async () => {
    expect.assertions(4)
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX does not define targeting values for a slot', async () => {
    expect.assertions(4)
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { bidResponses } = await indexExchangeBidder.fetchBids(tabAdsConfig)
    const expectedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 120 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '728x90',
          encodedRevenue: null,
        },
      ],
      // The primary rectangle ad (bottom-right).
      'div-gpt-ad-1464385742501-0': [
        {
          adId: 'div-gpt-ad-1464385742501-0',
          revenue: 3500 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '300x250',
          encodedRevenue: null,
        },
      ],
      // The second rectangle ad (right side, above the first).
      'div-gpt-ad-1539903223131-0': [
        {
          adId: 'div-gpt-ad-1539903223131-0',
          revenue: 5324 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '300x250',
          encodedRevenue: null,
        },
      ],
    }
    expect(bidResponses).toEqual(expectedBidResponses)
  })

  it('returns the expected normalized BidResponses in the bidResponses key when only one ad returns', async () => {
    expect.assertions(1)

    // Mock the bid response.
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const { mockIndexExchangeBidResponse } = require('src/utils/test-utils')

    // Mock that only one ad returns. This will happen when we request
    // ads for only one ad unit.
    const defaultMockBidResponse = mockIndexExchangeBidResponse()
    const mockBidResponse = {
      ...defaultMockBidResponse,
      slot: {
        'd-1-728x90-atf-bottom-leaderboard':
          defaultMockBidResponse.slot['d-1-728x90-atf-bottom-leaderboard'],
      },
    }

    ixTag.retrieveDemand.mockImplementation((config, callback) =>
      callback(mockBidResponse)
    )
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { bidResponses } = await indexExchangeBidder.fetchBids(tabAdsConfig)
    const expectedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 120 / 10e4,
          advertiserName: 'indexExchange',
          adSize: '728x90',
          encodedRevenue: null,
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

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

  it('does not throw or log an error if the bid response has no slot responses', async () => {
    expect.assertions(4)
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX returns an unexpected slot ID', async () => {
    expect.assertions(4)
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
            // weird slot name
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if we have a GAM slot without a corresponding IX slot', async () => {
    expect.assertions(4)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()
    googletag.pubads().getSlots.mockReturnValueOnce([
      {
        getAdUnitPath: () => '/foo/thing',
        getSlotElementId: () => 'div-whatever',
        setTargeting: jest.fn(),
      },
    ])

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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw or log an error if IX returns a slot without targeting values', async () => {
    expect.assertions(4)
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
              targeting: undefined, // this is missing
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const logger = require('src/utils/logger').default
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach((slot) => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('logs an error if something goes wrong during setTargeting', async () => {
    expect.assertions(1)
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()
    const mockErr = new Error('Uh oh.')
    googletag.cmd.push.mockImplementationOnce(() => {
      throw mockErr
    })

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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

    // Fetch bids.
    await indexExchangeBidder.fetchBids(tabAdsConfig)

    // Set targeting.
    indexExchangeBidder.setTargeting()

    const logger = require('src/utils/logger').default
    expect(logger.error).toHaveBeenCalledWith(mockErr)
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
