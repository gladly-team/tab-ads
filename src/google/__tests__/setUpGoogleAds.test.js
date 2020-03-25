/* eslint-env jest */

import setUpGoogleAds from 'src/google/setUpGoogleAds'
import getGoogleTag from 'src/google/getGoogleTag'
import { setConfig } from 'src/config'
import { getMockTabAdsUserConfig } from 'src/utils/test-utils'
import getGlobal from 'src/utils/getGlobal'

jest.mock('src/google/getGoogleTag')

const global = getGlobal()

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete global.googletag
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

  it('only define one ad slots when only one ad units is enabled', () => {
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
    setUpGoogleAds(tabAdsConfig)
    const googletag = getGoogleTag()
    expect(googletag.defineSlot).toHaveBeenCalledTimes(1)
    expect(googletag.defineSlot).toHaveBeenCalledWith(
      '/43865596/HBTR',
      expect.any(Array),
      'div-gpt-ad-1464385742501-0'
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
})
