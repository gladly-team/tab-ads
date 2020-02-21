/* eslint-env jest */

import prebidBidder from 'src/providers/prebid/prebidBidder'
import getGoogleTag from 'src/google/getGoogleTag'
import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import { setConfig } from 'src/config'
import {
  getMockTabAdsUserConfig,
  mockPrebidBidResponses,
} from 'src/utils/test-utils'

jest.mock('src/providers/prebid/built/pb')
jest.mock('src/providers/prebid/getPrebidPbjs')
jest.mock('src/utils/logger')

beforeEach(() => {
  delete window.pbjs
  window.pbjs = getPrebidPbjs()

  // Set up googletag
  delete window.googletag
  window.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete window.googletag
  delete window.pbjs
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

  it('includes the consentManagement setting when in the EU', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      consent: {
        isEU: () => Promise.resolve(true),
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(
      pbjs.setConfig.mock.calls[0][0].consentManagement
    ).not.toBeUndefined()
  })

  it('does not include consentManagement setting when not in the EU', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      consent: {
        isEU: () => Promise.resolve(false),
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.setConfig.mock.calls[0][0].consentManagement).toBeUndefined()
  })

  it('does not include consentManagement setting if consent.isEU throws', async () => {
    expect.assertions(1)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      consent: {
        isEU: () => {
          throw new Error('Uh oh.')
        },
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

    expect(adUnitConfig[0].bids.map(bid => bid.bidder).sort()).toEqual([
      'aol',
      'emx_digital',
      'openx',
      'pulsepoint',
      'rhythmone',
      'sonobi',
      'sovrn',
    ])
    expect(adUnitConfig[1].bids.map(bid => bid.bidder).sort()).toEqual([
      'aol',
      'emx_digital',
      'openx',
      'pulsepoint',
      'rhythmone',
      'sonobi',
      'sovrn',
    ])
    expect(adUnitConfig[2].bids.map(bid => bid.bidder).sort()).toEqual([
      'aol',
      // 'emx_digital',
      'openx',
      'pulsepoint',
      'rhythmone',
      'sonobi',
      'sovrn',
    ])
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

  it('sets pbjs.bidderSettings to include the AOL 80% bidCpmAdjustment', async () => {
    expect.assertions(2)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.bidderSettings.aol).toBeDefined()
    expect(pbjs.bidderSettings.aol.bidCpmAdjustment(2)).toEqual(1.6)
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
    pbjs.requestBids = jest.fn(requestBidsSettings => {
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
    pbjs.requestBids = jest.fn(requestBidsSettings => {
      requestBidsSettings.bidsBackHandler(mockBidResponses)
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    const { bidResponses } = await prebidBidder.fetchBids(tabAdsConfig)

    const normalizedBidResponses = {
      // The long leaderboard ad.
      'div-gpt-ad-1464385677836-0': [
        {
          revenue: 0.582 / 1000,
          advertiserName: 'openx',
          adSize: '728x90',
          encodedRevenue: null,
          GAMAdvertiserId: null,
        },
        {
          revenue: 4.21 / 1000,
          advertiserName: 'appnexus',
          adSize: '728x90',
          encodedRevenue: null,
          GAMAdvertiserId: null,
        },
        {
          revenue: 0.19 / 1000,
          advertiserName: 'emxdigital',
          adSize: '728x90',
          encodedRevenue: null,
          GAMAdvertiserId: null,
        },
      ],
      // The primary rectangle ad (bottom-right).
      'div-gpt-ad-1464385742501-0': [],
      // The second rectangle ad (right side, above the first).
      'div-gpt-ad-1539903223131-0': [
        {
          revenue: 1.01 / 1000,
          advertiserName: 'openx',
          adSize: '300x250',
          encodedRevenue: null,
          GAMAdvertiserId: null,
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
