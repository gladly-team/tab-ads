/* eslint-env jest */

import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import {
  mockAmazonBidResponse,
  getMockTabAdsUserConfig,
} from 'src/utils/test-utils'
import { setConfig } from 'src/config'

jest.mock('src/consentManagement')
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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

    // Set the mock Amazon bid responses.
    const mockBid = mockAmazonBidResponse()
    const mockBidResponses = [
      {
        ...mockBid,
        amznbid: 'abcdef',
        amzniid: 'some-id-number-1',
        amznp: '1',
        amznsz: '728x90',
        size: '728x90',
        slotID: 'div-gpt-ad-123456789-0',
      },
      {
        ...mockBid,
        amznbid: 'ghijkl',
        amzniid: 'some-id-number-2',
        amznp: '1',
        amznsz: '300x250',
        size: '300x250',
        slotID: 'div-gpt-ad-13579135-0',
      },
      {
        ...mockBid,
        amznbid: 'mnopqr',
        amzniid: 'some-id-number-3',
        amznp: '1',
        amznsz: '300x250',
        size: '300x250',
        slotID: 'div-gpt-ad-24680246-0',
      },
    ]
    apstag.fetchBids = jest.fn((config, callback) => {
      callback(mockBidResponses)
    })

    const { rawBidResponses } = await amazonBidder.fetchBids(tabAdsConfig)
    expect(rawBidResponses).toEqual(mockBidResponses)
  })

  it('returns the expected normalized BidResponses in the bidResponses key', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())

    // Set the mock Amazon bid responses.
    const mockBid = mockAmazonBidResponse()
    const mockBidResponses = [
      {
        ...mockBid,
        amznbid: 'encoded-revenue-abcdef',
        amzniid: 'some-id-number-1',
        amznp: '1',
        amznsz: '728x90',
        size: '728x90',
        slotID: 'div-gpt-ad-123456789-0',
      },
      {
        ...mockBid,
        amznbid: 'encoded-revenue-ghijkl',
        amzniid: 'some-id-number-2',
        amznp: '1',
        amznsz: '300x250',
        size: '300x250',
        slotID: 'div-gpt-ad-13579135-0',
      },
      {
        ...mockBid,
        amznbid: 'encoded-revenue-mnopqr',
        amzniid: 'some-id-number-3',
        amznp: '1',
        amznsz: '300x250',
        size: '300x250',
        slotID: 'div-gpt-ad-24680246-0',
      },
    ]
    apstag.fetchBids = jest.fn((config, callback) => {
      callback(mockBidResponses)
    })

    const { bidResponses } = await amazonBidder.fetchBids(tabAdsConfig)
    const expectedBidResponses = {
      'div-gpt-ad-123456789-0': {
        encodedRevenue: 'encoded-revenue-abcdef',
        advertiserName: 'amazon',
        adSize: '728x90',
        revenue: null,
        GAMAdvertiserId: null,
      },
      'div-gpt-ad-13579135-0': {
        encodedRevenue: 'encoded-revenue-ghijkl',
        advertiserName: 'amazon',
        adSize: '300x250',
        revenue: null,
        GAMAdvertiserId: null,
      },
      'div-gpt-ad-24680246-0': {
        encodedRevenue: 'encoded-revenue-mnopqr',
        advertiserName: 'amazon',
        adSize: '300x250',
        revenue: null,
        GAMAdvertiserId: null,
      },
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
