/* eslint-env jest */

import prebidBidder from 'src/providers/prebid/prebidBidder'
import getGoogleTag from 'src/google/getGoogleTag'
import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import { setConfig } from 'src/config'

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
    const tabAdsConfig = setConfig()
    await prebidBidder.fetchBids(tabAdsConfig)
  })

  it('sets the Prebid config', async () => {
    expect.assertions(2)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig()
    await prebidBidder.fetchBids(tabAdsConfig)

    const config = pbjs.setConfig.mock.calls[0][0]

    expect(config.pageUrl).toBeDefined()
    expect(config.publisherDomain).toBeDefined()
  })

  it('sets up ad units', async () => {
    expect.assertions(3)

    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig()
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
      consent: {
        isEU: () => Promise.resolve(false),
      },
    })
    await prebidBidder.fetchBids(tabAdsConfig)
    expect(pbjs.setConfig.mock.calls[0][0].consentManagement).toBeUndefined()
  })

  it('includes the expected list of bidders for each ad', async () => {
    expect.assertions(3)
    const pbjs = getPrebidPbjs()
    const tabAdsConfig = setConfig()
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

  it('returns the expected BidResponseData structure', async () => {
    expect.assertions(1)
    const tabAdsConfig = setConfig()
    const response = await prebidBidder.fetchBids(tabAdsConfig)
    expect(response).toMatchObject({
      bidResponses: expect.any(Object),
      rawBidResponses: expect.any(Object),
    })
  })

  // TODO: test BidResponseData structure more
})
