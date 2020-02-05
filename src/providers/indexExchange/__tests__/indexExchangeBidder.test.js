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

describe('indexExchangeBidder', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const tabAdsConfig = setConfig()
    await indexExchangeBidder(tabAdsConfig)
  })

  it('gets bids for the three ads', async () => {
    expect.assertions(2)
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const getIndexExchangeTag = require('src/providers/indexExchange/getIndexExchangeTag')
      .default
    const ixTag = getIndexExchangeTag()
    const tabAdsConfig = setConfig()
    await indexExchangeBidder(tabAdsConfig)
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
      indexExchangeBidder(tabAdsConfig).then(() => {
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
      indexExchangeBidder(tabAdsConfig).then(() => {
        done()
      })

      // Here, bidder timeout is 700ms.
      jest.advanceTimersByTime(701)
    })
  })

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
    await indexExchangeBidder(tabAdsConfig)
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
    await indexExchangeBidder(tabAdsConfig)
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

  it('does not throw, log an error, or set targeting if the bid response is undefined', async () => {
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
    await indexExchangeBidder(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw, log an error, or set targeting if the bid response is an empty object', async () => {
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
    await indexExchangeBidder(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw, log an error, or set targeting if the bid response has no slot responses', async () => {
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
    await indexExchangeBidder(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw, log an error, or set targeting if IX returns an unexpected slot ID', async () => {
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
    await indexExchangeBidder(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('does not throw, log an error, or set targeting if IX does not define targeting values for a slot', async () => {
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
    await indexExchangeBidder(tabAdsConfig)
    expect(logger.error).not.toHaveBeenCalled()
    googletag
      .pubads()
      .getSlots()
      .forEach(slot => {
        expect(slot.setTargeting).not.toHaveBeenCalled()
      })
  })

  it('stores the bids for analytics', async () => {
    expect.assertions(3)
    const { getAdDataStore } = require('src/utils/storage')
    const adDataStore = getAdDataStore()

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
    await indexExchangeBidder(tabAdsConfig)
    expect(
      adDataStore.indexExchangeBids[tabAdsConfig.newTabAds.leaderboard.adId]
    ).toEqual([
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
    ])
    expect(
      adDataStore.indexExchangeBids[
        tabAdsConfig.newTabAds.rectangleAdPrimary.adId
      ]
    ).toEqual([
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
    ])
    expect(
      adDataStore.indexExchangeBids[
        tabAdsConfig.newTabAds.rectangleAdSecondary.adId
      ]
    ).toEqual([
      {
        targeting: {
          some_key: 'my-cool-value123',
          ad_thing: 'thingy_abc',
        },
        price: 5000,
        adm: '_admcodehere_',
        size: [300, 250],
        partnerId: 'SomePartner',
      },
    ])
  })
})

describe('markIndexExchangeBidsAsIncluded', () => {
  it('sets the IX bids "includedInAdServerRequest" property to true', () => {
    const { getAdDataStore } = require('src/utils/storage')
    const adDataStore = getAdDataStore()
    expect(adDataStore.indexExchangeBids.includedInAdServerRequest).toBe(false)
    const {
      markIndexExchangeBidsAsIncluded,
    } = require('src/providers/indexExchange/indexExchangeBidder')
    markIndexExchangeBidsAsIncluded()
    expect(adDataStore.indexExchangeBids.includedInAdServerRequest).toBe(true)
  })
})
