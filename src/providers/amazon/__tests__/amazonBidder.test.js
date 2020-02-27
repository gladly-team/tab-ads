/* eslint-env jest */

import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import {
  mockAmazonBidResponse,
  getMockTabAdsUserConfig,
} from 'src/utils/test-utils'
import { setConfig } from 'src/config'

jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/utils/logger')

beforeEach(() => {
  // Mock apstag
  delete window.apstag
  window.apstag = getAmazonTag()
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete window.apstag
})

describe('amazonBidder: fetchBids', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await amazonBidder.fetchBids(tabAdsConfig)
  })

  it('calls apstag.init with the expected publisher ID and ad server', async () => {
    expect.assertions(1)
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await amazonBidder.fetchBids(tabAdsConfig)

    expect(apstag.init.mock.calls[0][0]).toMatchObject({
      pubID: 'ea374841-51b0-4335-9960-99200427f7c8',
      adServer: 'googletag',
    })
  })

  it('calls apstag.fetchBids', async () => {
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await amazonBidder.fetchBids(tabAdsConfig)

    expect(apstag.fetchBids).toHaveBeenCalled()
  })

  it('resolves immediately when we expect the mock to return bids immediately', async () => {
    expect.assertions(1)

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const promise = amazonBidder.fetchBids(tabAdsConfig)
    promise.done = false
    promise.then(() => {
      promise.done = true
    })

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))
    expect(promise.done).toBe(true)
  })

  it('only resolves after the auction ends', async () => {
    expect.assertions(2)

    // Manually resolve the Amazon bid response.
    let bidsBackCallback
    const apstag = getAmazonTag()
    apstag.fetchBids = jest.fn((config, callback) => {
      bidsBackCallback = callback
    })

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const promise = amazonBidder.fetchBids(tabAdsConfig)
    promise.done = false
    promise.then(() => {
      promise.done = true
    })

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(promise.done).toBe(false)

    // Pretend the Amazon bids return.
    bidsBackCallback([])

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(promise.done).toBe(true)
  })

  it('calls for the expected bids when all ads are enabled', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await amazonBidder.fetchBids(tabAdsConfig)
    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-1464385677836-0',
          sizes: [[728, 90]],
        },
        {
          slotID: 'div-gpt-ad-1464385742501-0',
          sizes: [[300, 250]],
        },
        {
          slotID: 'div-gpt-ad-1539903223131-0',
          sizes: [[300, 250]],
        },
      ],
    })
  })

  it('returns the expected Amazon bid responses in the rawBidResponses key', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default

    const mockLeaderboardAdId = 'div-gpt-ad-123456789-0'
    const mockRectanglePrimaryAdId = 'div-gpt-ad-13579135-0'
    const mockRectangleSecondaryAdId = 'div-gpt-ad-24680246-0'

    // Set the mock Amazon bid responses.
    const mockBid = mockAmazonBidResponse()
    const mockBidResponses = [
      {
        ...mockBid,
        amznbid: 'abcdef',
        amzniid: 'some-id-number-1',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockLeaderboardAdId,
      },
      {
        ...mockBid,
        amznbid: 'ghijkl',
        amzniid: 'some-id-number-2',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectanglePrimaryAdId,
      },
      {
        ...mockBid,
        amznbid: 'mnopqr',
        amzniid: 'some-id-number-3',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectangleSecondaryAdId,
      },
    ]
    apstag.fetchBids = jest.fn((config, callback) => {
      callback(mockBidResponses)
    })

    // Manually override the tab-ads config to use the mock ad IDs.
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const tabAdsConfigModified = {
      ...tabAdsConfig,
      newTabAds: {
        leaderboard: {
          adId: mockLeaderboardAdId,
          adUnitId: '/43865596/HBTL',
          sizes: [[728, 90]],
        },
        rectangleAdPrimary: {
          adId: mockRectanglePrimaryAdId,
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
        },
        rectangleAdSecondary: {
          adId: mockRectangleSecondaryAdId,
          adUnitId: '/43865596/HBTR2',
          sizes: [[300, 250]],
        },
      },
    }
    const { rawBidResponses } = await amazonBidder.fetchBids(
      tabAdsConfigModified
    )
    expect(rawBidResponses).toEqual(mockBidResponses)
  })

  it('returns the expected normalized BidResponses in the bidResponses key', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default

    const mockLeaderboardAdId = 'div-gpt-ad-123456789-0'
    const mockRectanglePrimaryAdId = 'div-gpt-ad-13579135-0'
    const mockRectangleSecondaryAdId = 'div-gpt-ad-24680246-0'

    // Set the mock Amazon bid responses.
    const mockBid = mockAmazonBidResponse()
    const mockBidResponses = [
      {
        ...mockBid,
        amznbid: 'abcdef',
        amzniid: 'some-id-number-1',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockLeaderboardAdId,
      },
      {
        ...mockBid,
        amznbid: 'ghijkl',
        amzniid: 'some-id-number-2',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectanglePrimaryAdId,
      },
      {
        ...mockBid,
        amznbid: 'mnopqr',
        amzniid: 'some-id-number-3',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectangleSecondaryAdId,
      },
    ]
    apstag.fetchBids = jest.fn((config, callback) => {
      callback(mockBidResponses)
    })

    // Manually override the tab-ads config to use the mock ad IDs.
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const tabAdsConfigModified = {
      ...tabAdsConfig,
      newTabAds: {
        leaderboard: {
          adId: mockLeaderboardAdId,
          adUnitId: '/43865596/HBTL',
          sizes: [[728, 90]],
        },
        rectangleAdPrimary: {
          adId: mockRectanglePrimaryAdId,
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
        },
        rectangleAdSecondary: {
          adId: mockRectangleSecondaryAdId,
          adUnitId: '/43865596/HBTR2',
          sizes: [[300, 250]],
        },
      },
    }

    const { bidResponses } = await amazonBidder.fetchBids(tabAdsConfigModified)
    const expectedBidResponses = {
      'div-gpt-ad-123456789-0': [
        {
          adId: mockLeaderboardAdId,
          encodedRevenue: 'abcdef',
          advertiserName: 'amazon',
          adSize: '728x90', // Uses ad size from the tab-ads config
          revenue: null,
        },
      ],
      'div-gpt-ad-13579135-0': [
        {
          adId: mockRectanglePrimaryAdId,
          encodedRevenue: 'ghijkl',
          advertiserName: 'amazon',
          adSize: '300x250',
          revenue: null,
        },
      ],
      'div-gpt-ad-24680246-0': [
        {
          adId: mockRectangleSecondaryAdId,
          encodedRevenue: 'mnopqr',
          advertiserName: 'amazon',
          adSize: '300x250',
          revenue: null,
        },
      ],
    }
    expect(bidResponses).toEqual(expectedBidResponses)
  })

  it('ignores any bids that have an empty string in the raw bid response "amzniid" property', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default

    const mockLeaderboardAdId = 'div-gpt-ad-123456789-0'
    const mockRectanglePrimaryAdId = 'div-gpt-ad-13579135-0'
    const mockRectangleSecondaryAdId = 'div-gpt-ad-24680246-0'

    // Set the mock Amazon bid responses.
    const mockBid = mockAmazonBidResponse()
    const mockBidResponses = [
      {
        ...mockBid,
        amznbid: 'abcdef',
        amzniid: '', // should ignore this bid
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockLeaderboardAdId,
      },
      {
        ...mockBid,
        amznbid: 'ghijkl',
        amzniid: 'some-id-number-2',
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectanglePrimaryAdId,
      },
      {
        ...mockBid,
        amznbid: 'mnopqr',
        amzniid: '', // should ignore this bid
        amznp: '1',
        amznsz: '0x0',
        size: '0x0',
        slotID: mockRectangleSecondaryAdId,
      },
    ]
    apstag.fetchBids = jest.fn((config, callback) => {
      callback(mockBidResponses)
    })

    // Manually override the tab-ads config to use the mock ad IDs.
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const tabAdsConfigModified = {
      ...tabAdsConfig,
      newTabAds: {
        leaderboard: {
          adId: mockLeaderboardAdId,
          adUnitId: '/43865596/HBTL',
          sizes: [[728, 90]],
        },
        rectangleAdPrimary: {
          adId: mockRectanglePrimaryAdId,
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
        },
        rectangleAdSecondary: {
          adId: mockRectangleSecondaryAdId,
          adUnitId: '/43865596/HBTR2',
          sizes: [[300, 250]],
        },
      },
    }

    const { bidResponses } = await amazonBidder.fetchBids(tabAdsConfigModified)
    const expectedBidResponses = {
      'div-gpt-ad-123456789-0': [], // no valid bid
      'div-gpt-ad-13579135-0': [
        {
          adId: mockRectanglePrimaryAdId,
          encodedRevenue: 'ghijkl',
          advertiserName: 'amazon',
          adSize: '300x250',
          revenue: null,
        },
      ],
      'div-gpt-ad-24680246-0': [], // no valid bid
    }
    expect(bidResponses).toEqual(expectedBidResponses)
  })
})

describe('amazonBidder: setTargeting', () => {
  it('calls apstag.setDisplayBids', () => {
    expect.assertions(1)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.setTargeting()
    const apstag = getAmazonTag()
    expect(apstag.setDisplayBids).toHaveBeenCalled()
  })
})

describe('amazonBidder: name', () => {
  it('has the expected bidder name', () => {
    expect.assertions(1)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    expect(amazonBidder.name).toEqual('amazon')
  })
})
