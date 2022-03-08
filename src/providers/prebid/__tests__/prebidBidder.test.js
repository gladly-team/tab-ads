/* eslint-env jest */

import prebidBidder from 'src/providers/prebid/prebidBidder'
import getGoogleTag from 'src/google/getGoogleTag'
import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import { setConfig } from 'src/config'
import {
  getMockTabAdsUserConfig,
  mockPrebidBidResponses,
} from 'src/utils/test-utils'
import getGlobal from 'src/utils/getGlobal'

jest.mock('src/providers/prebid/built/pb')
jest.mock('src/providers/prebid/getPrebidPbjs')
jest.mock('src/utils/logger')

const global = getGlobal()

beforeEach(() => {
  delete global.pbjs
  global.pbjs = getPrebidPbjs()

  // Set up googletag
  delete global.googletag
  global.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete global.googletag
  delete global.pbjs
})

describe('prebidBidder: fetchBids', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)
  })

  it('sets the Prebid config', async () => {
    expect.assertions(2)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)

    const config = pbjs.setConfig.mock.calls[0][0]

    expect(config.pageUrl).toBeDefined()
    expect(config.publisherDomain).toBeDefined()
  })

  it('sets debug === false when the tab-ads logLevel is "error"', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'error',
    })
    await prebidBidder.fetchBids(tabAdsConfig)

    const config = pbjs.setConfig.mock.calls[0][0]
    expect(config.debug).toBe(false)
  })

  it('sets debug === true when the tab-ads logLevel is "debug"', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'debug',
    })
    await prebidBidder.fetchBids(tabAdsConfig)

    const config = pbjs.setConfig.mock.calls[0][0]
    expect(config.debug).toBe(true)
  })

  it('sets the publisherDomain and pageUrl using the tab-config values', async () => {
    expect.assertions(2)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      publisher: {
        domain: 'https://foo.com',
        pageUrl: 'https://foo.com/something/',
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)

    const config = pbjs.setConfig.mock.calls[0][0]

    expect(config.pageUrl).toEqual('https://foo.com/something/')
    expect(config.publisherDomain).toEqual('https://foo.com')
  })

  it('sets up ad units', async () => {
    expect.assertions(3)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)

    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]
    expect(adUnitConfig[0].code).toBeDefined()
    expect(adUnitConfig[0].mediaTypes).toBeDefined()
    expect(adUnitConfig[0].bids).toBeDefined()
  })

  it('includes the consentManagement setting', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(
      pbjs.setConfig.mock.calls[0][0].consentManagement
    ).not.toBeUndefined()
  })

  it('includes the expected consentManagement GDPR settings', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      consent: {
        timeout: 161,
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(
      pbjs.setConfig.mock.calls[0][0].consentManagement.gdpr
    ).toMatchObject({
      cmpApi: 'iab',
      timeout: 161,
      defaultGdprScope: false,
    })
  })

  it('includes the expected consentManagement USP settings', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      consent: {
        timeout: 161,
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.setConfig.mock.calls[0][0].consentManagement.usp).toMatchObject(
      {
        cmpApi: 'iab',
        timeout: 161,
      }
    )
  })

  it('does not include the consentManagement setting if config.consent.enabled is false', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const mockConfig = getMockTabAdsUserConfig()
    const tabAdsConfig = setConfig({
      ...mockConfig,
      consent: {
        ...mockConfig.consent,
        enabled: false,
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.setConfig.mock.calls[0][0].consentManagement).toBeUndefined()
  })

  it('includes the expected list of bidders for each ad', async () => {
    expect.assertions(3)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)
    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]

    expect(adUnitConfig[0].bids.map((bid) => bid.bidder).sort()).toEqual([
      'emx_digital',
      'openx',
      'pulsepoint',
      'rubicon',
      'sonobi',
      'sovrn',
      'unruly',
      'yahoossp',
    ])
    expect(adUnitConfig[1].bids.map((bid) => bid.bidder).sort()).toEqual([
      'emx_digital',
      'openx',
      'pulsepoint',
      'rubicon',
      'sonobi',
      'sovrn',
      'unruly',
      'yahoossp',
    ])
    expect(adUnitConfig[2].bids.map((bid) => bid.bidder).sort()).toEqual([
      // 'emx_digital',
      'openx',
      'pulsepoint',
      'rubicon',
      'sonobi',
      'sovrn',
      'unruly',
      'yahoossp',
    ])
  })

  it('does not call for any bids if the tab-ads adUnits value is an empty array', async () => {
    expect.assertions(2)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.addAdUnits).not.toHaveBeenCalled()
    expect(pbjs.requestBids).not.toHaveBeenCalled()
  })

  it('returns a Promise that resolves to empty bid response info when no ads are enabled', async () => {
    expect.assertions(1)
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    const response = await prebidBidder.fetchBids(tabAdsConfig)
    expect(response).toEqual({
      bidResponses: {},
      rawBidResponses: {},
    })
  })

  it('sets up only the leaderboard ad unit if the tab-ads adUnits value is the one leaderboard ad', async () => {
    expect.assertions(2)
    const pbjs = getPrebidPbjs()
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
    await prebidBidder.fetchBids(tabAdsConfig)
    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]

    expect(adUnitConfig.length).toBe(1)
    expect(adUnitConfig[0]).toMatchObject({
      code: 'div-gpt-ad-1464385677836-0',
      mediaTypes: {
        banner: {
          sizes: [[728, 90]],
        },
      },
      bids: expect.any(Array),
    })
  })

  it('sets up only the primary rectangle ad unit if the tab-ads adUnits value is that one ad', async () => {
    expect.assertions(2)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The primary rectangle ad (bottom-right).
          adId: 'div-gpt-ad-1464385742501-0',
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
        },
      ],
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]

    expect(adUnitConfig.length).toBe(1)
    expect(adUnitConfig[0]).toMatchObject({
      code: 'div-gpt-ad-1464385742501-0',
      mediaTypes: {
        banner: {
          sizes: [[300, 250]],
        },
      },
      bids: expect.any(Array),
    })
  })

  it('sets up only the secondary rectangle ad unit if the tab-ads adUnits value is that one ad', async () => {
    expect.assertions(2)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The second rectangle ad (right side, above the first).
          adId: 'div-gpt-ad-1539903223131-0',
          adUnitId: '/43865596/HBTR2',
          sizes: [[300, 250]],
        },
      ],
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]

    expect(adUnitConfig.length).toBe(1)
    expect(adUnitConfig[0]).toMatchObject({
      code: 'div-gpt-ad-1539903223131-0',
      mediaTypes: {
        banner: {
          sizes: [[300, 250]],
        },
      },
      bids: expect.any(Array),
    })
  })

  it('sets up two ads if the tab-ads adUnits value is two ads', async () => {
    expect.assertions(3)
    const pbjs = getPrebidPbjs()
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
          // The second rectangle ad (right side, above the first).
          adId: 'div-gpt-ad-1539903223131-0',
          adUnitId: '/43865596/HBTR2',
          sizes: [[300, 250]],
        },
      ],
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    const adUnitConfig = pbjs.addAdUnits.mock.calls[0][0]

    expect(adUnitConfig.length).toBe(2)
    expect(adUnitConfig[0]).toMatchObject({
      code: 'div-gpt-ad-1464385677836-0',
      mediaTypes: {
        banner: {
          sizes: [[728, 90]],
        },
      },
      bids: expect.any(Array),
    })
    expect(adUnitConfig[1]).toMatchObject({
      code: 'div-gpt-ad-1539903223131-0',
      mediaTypes: {
        banner: {
          sizes: [[300, 250]],
        },
      },
      bids: expect.any(Array),
    })
  })

  it('calls pbjs.requestBids', async () => {
    expect.assertions(1)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.requestBids).toHaveBeenCalledWith({
      bidsBackHandler: expect.any(Function),
    })
  })

  it('returns the expected BidResponseData structure', async () => {
    expect.assertions(1)
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const response = await prebidBidder.fetchBids(tabAdsConfig)
    expect(response).toMatchObject({
      bidResponses: expect.any(Object),
      rawBidResponses: expect.any(Object),
    })
  })

  it('returns the raw Prebid bid responses in the rawBidResponses key', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()

    // Set the mock Prebid bid responses.
    const mockBidResponses = mockPrebidBidResponses()
    pbjs.requestBids = jest.fn((requestBidsSettings) => {
      requestBidsSettings.bidsBackHandler(mockBidResponses)
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { rawBidResponses } = await prebidBidder.fetchBids(tabAdsConfig)
    expect(rawBidResponses).toEqual(mockBidResponses)
  })

  it('returns the expected normalized BidResponses in the bidResponses key', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()

    // Set the mock Prebid bid responses.
    const mockBidResponses = mockPrebidBidResponses()
    pbjs.requestBids = jest.fn((requestBidsSettings) => {
      requestBidsSettings.bidsBackHandler(mockBidResponses)
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { bidResponses } = await prebidBidder.fetchBids(tabAdsConfig)

    const normalizedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 0.582 / 1000,
          advertiserName: 'openx',
          adSize: '728x90',
          encodedRevenue: null,
        },
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 4.21 / 1000,
          advertiserName: 'appnexus',
          adSize: '728x90',
          encodedRevenue: null,
        },
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 0.19 / 1000,
          advertiserName: 'emxdigital',
          adSize: '728x90',
          encodedRevenue: null,
        },
      ],
      // The primary rectangle ad (bottom-right).
      'div-gpt-ad-1464385742501-0': [],
      // The second rectangle ad (right side, above the first).
      'div-gpt-ad-1539903223131-0': [
        {
          adId: 'div-gpt-ad-1539903223131-0',
          revenue: 1.01 / 1000,
          advertiserName: 'openx',
          adSize: '300x250',
          encodedRevenue: null,
        },
      ],
    }
    expect(bidResponses).toEqual(normalizedBidResponses)
  })

  it('returns the expected normalized BidResponses in the bidResponses key when there is only one ad returned', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()

    // Set the mock Prebid bid responses.
    const mockBidResponses = {
      // Only one ad response. This will happen if we only request for one ad unit.
      'div-gpt-ad-1464385677836-0':
        mockPrebidBidResponses()['div-gpt-ad-1464385677836-0'],
    }
    pbjs.requestBids = jest.fn((requestBidsSettings) => {
      requestBidsSettings.bidsBackHandler(mockBidResponses)
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { bidResponses } = await prebidBidder.fetchBids(tabAdsConfig)

    const normalizedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 0.582 / 1000,
          advertiserName: 'openx',
          adSize: '728x90',
          encodedRevenue: null,
        },
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 4.21 / 1000,
          advertiserName: 'appnexus',
          adSize: '728x90',
          encodedRevenue: null,
        },
        {
          adId: 'div-gpt-ad-1464385677836-0',
          revenue: 0.19 / 1000,
          advertiserName: 'emxdigital',
          adSize: '728x90',
          encodedRevenue: null,
        },
      ],
    }
    expect(bidResponses).toEqual(normalizedBidResponses)
  })
})

describe('prebidBidder: setTargeting', () => {
  it('calls setTargetingForGPTAsync', () => {
    expect.assertions(1)
    prebidBidder.setTargeting()
    const pbjs = getPrebidPbjs()
    expect(pbjs.setTargetingForGPTAsync).toHaveBeenCalled()
  })
})

describe('prebidBidder: name', () => {
  it('has the expected bidder name', () => {
    expect.assertions(1)
    expect(prebidBidder.name).toEqual('prebid')
  })
})
