/* eslint-env jest */

import setUpGoogleAds from 'src/google/setUpGoogleAds'
// eslint-disable-next-line import/named
import getGoogleTag, { __reset } from 'src/google/getGoogleTag'
import { setConfig } from 'src/config'
import { getMockTabAdsUserConfig } from 'src/utils/test-utils'

jest.mock('src/google/getGoogleTag')

afterEach(() => {
  jest.clearAllMocks()
  __reset()
})

describe('setUpGoogleAds', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    setUpGoogleAds(tabAdsConfig)
  })

  it('defines the expected ad slots when all ad units are enabled', () => {
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot.mock.calls.length).toBe(3)
    expect(googletag.defineSlot.mock.calls[0]).toEqual([
      '/43865596/HBTL',
      expect.any(Array),
      'div-gpt-ad-1464385677836-0',
    ])
    expect(googletag.defineSlot.mock.calls[1]).toEqual([
      '/43865596/HBTR',
      expect.any(Array),
      'div-gpt-ad-1464385742501-0',
    ])
    expect(googletag.defineSlot.mock.calls[2]).toEqual([
      '/43865596/HBTR2',
      expect.any(Array),
      'div-gpt-ad-1539903223131-0',
    ])
  })

  it('defines no ad slots when no ad units are enabled', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot).not.toHaveBeenCalled()
  })

  it('does not enable ad services when when no ad units are enabled', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [],
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.enableServices).not.toHaveBeenCalled()
  })

  it('only defines one ad slots when only one ad unit is enabled', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The primary rectangle ad (bottom-right).
          adId: 'div-gpt-ad-1464385742501-0',
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
          allowedAdSlotSizes: [[300, 250]],
        },
      ],
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot).toHaveBeenCalledTimes(1)
    expect(googletag.defineSlot).toHaveBeenCalledWith(
      '/43865596/HBTR',
      expect.any(Array),
      'div-gpt-ad-1464385742501-0'
    )
  })

  it('uses the ad unit\'s "sizes" property if "allowedAdSlotSizes" is not defined', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The primary rectangle ad (bottom-right).
          adId: 'div-gpt-ad-1464385742501-0',
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
          allowedAdSlotSizes: undefined,
        },
      ],
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot).toHaveBeenCalledTimes(1)
    expect(googletag.defineSlot).toHaveBeenCalledWith(
      expect.any(String),
      [[300, 250]],
      expect.any(String)
    )
  })

  it('uses the ad unit\'s "allowedAdSlotSizes" property if it is defined', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      adUnits: [
        {
          // The primary rectangle ad (bottom-right).
          adId: 'div-gpt-ad-1464385742501-0',
          adUnitId: '/43865596/HBTR',
          sizes: [[300, 250]],
          allowedAdSlotSizes: [
            [300, 250],
            [300, 600],
          ],
        },
      ],
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot).toHaveBeenCalledTimes(1)
    expect(googletag.defineSlot).toHaveBeenCalledWith(
      expect.any(String),
      [
        [300, 250],
        [300, 600],
      ],
      expect.any(String)
    )
  })

  it('enables single request mode', () => {
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.pubads().enableSingleRequest).toHaveBeenCalled()
  })

  it('enables ad services', () => {
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.enableServices).toHaveBeenCalled()
  })

  it('only defines one page level key value pair when only one one page level key value pair is enabled', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      pageLevelKeyValues: { v4: 'true' },
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.pubads().setTargeting).toHaveBeenCalledTimes(1)
    expect(googletag.pubads().setTargeting).toHaveBeenCalledWith('v4', 'true')
  })

  it('only defines page level key value pair for every key value entry in the array', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      pageLevelKeyValues: { v4: 'true', trees: 'true' },
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.pubads().setTargeting).toHaveBeenCalledTimes(2)
    expect(googletag.pubads().setTargeting).toHaveBeenCalledWith('v4', 'true')
    expect(googletag.pubads().setTargeting).toHaveBeenCalledWith(
      'trees',
      'true'
    )
  })

  it('does not defines page level key value pair when there are no key value entry in the object', () => {
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
    })
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.pubads().setTargeting).not.toHaveBeenCalled()
  })
})
