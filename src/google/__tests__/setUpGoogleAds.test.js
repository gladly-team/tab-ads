/* eslint-env jest */

import setUpGoogleAds from 'src/google/setUpGoogleAds'
import getGoogleTag from 'src/google/getGoogleTag'
import { setConfig } from 'src/config'
import { getMockTabAdsUserConfig } from 'src/utils/test-utils'

jest.mock('src/google/getGoogleTag')

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  delete window.googletag
})

describe('setUpGoogleAds', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    setUpGoogleAds(tabAdsConfig)
  })

  it('defines the expected ad slots', () => {
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
