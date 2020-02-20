/* eslint-env jest */

import { getMockTabAdsUserConfig } from 'src/utils/test-utils'

const mockGoogleDisplayAd = jest.fn()
jest.mock('src/google/googleDisplayAd', () => mockGoogleDisplayAd)
jest.mock('src/config')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  jest.clearAllMocks()
  // jest.resetModules()
})

describe('displayAd', () => {
  it('calls googleDisplayAd with the ad ID when ads are enabled', () => {
    const { setConfig, getConfig } = require('src/config')
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: false,
      useMockAds: false,
    })
    getConfig.mockReturnValue(tabAdsConfig)
    const displayAd = require('src/displayAd').default
    displayAd('some-ad', tabAdsConfig)
    expect(mockGoogleDisplayAd).toHaveBeenCalledWith('some-ad')
  })

  it('does not callgoogleDisplayAd when ads are NOT enabled', () => {
    const { setConfig, getConfig } = require('src/config')
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: false,
    })
    getConfig.mockReturnValue(tabAdsConfig)
    const displayAd = require('src/displayAd').default
    displayAd('some-ad', tabAdsConfig)
    expect(mockGoogleDisplayAd).not.toHaveBeenCalled()
  })

  it('creates a mock ad when ads are disabled and mock ads are enabled', () => {
    const { setConfig, getConfig } = require('src/config')
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: true,
    })
    getConfig.mockReturnValue(tabAdsConfig)

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad', tabAdsConfig)
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).toHaveBeenCalledWith(
      'style',
      expect.any(String)
    )
  })

  it('does not create a mock ad when ads are enabled', () => {
    const { setConfig, getConfig } = require('src/config')
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: false,
      useMockAds: true,
    })
    getConfig.mockReturnValue(tabAdsConfig)

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad', tabAdsConfig)
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).not.toHaveBeenCalled()
  })

  it('does not create a mock ad when ads are disabled but mock ads are NOT enabled', () => {
    const { setConfig, getConfig } = require('src/config')
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: false,
    })
    getConfig.mockReturnValue(tabAdsConfig)

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad', tabAdsConfig)
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).not.toHaveBeenCalled()
  })
})
