/* eslint-env jest */

import { getMockTabAdsUserConfig } from 'src/utils/test-utils'
import queue from 'src/utils/queue'

const mockGoogleDisplayAd = jest.fn()
jest.mock('src/google/googleDisplayAd', () => mockGoogleDisplayAd)

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  jest.clearAllMocks()

  // Set that the queue is not yet ready to run.
  queue.runQueue(false)
})

describe('displayAd', () => {
  it('calls googleDisplayAd with the ad ID when ads are enabled', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: false,
      useMockAds: false,
    })
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    expect(mockGoogleDisplayAd).toHaveBeenCalledWith('some-ad')
  })

  it('does not callgoogleDisplayAd when ads are NOT enabled', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: false,
    })
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    expect(mockGoogleDisplayAd).not.toHaveBeenCalled()
  })

  it('creates a mock ad when ads are disabled and mock ads are enabled', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: true,
    })

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).toHaveBeenCalledWith(
      'style',
      expect.any(String)
    )
  })

  it('does not create a mock ad when ads are enabled', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: false,
      useMockAds: true,
    })

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).not.toHaveBeenCalled()
  })

  it('does not create a mock ad when ads are disabled but mock ads are NOT enabled', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true,
      useMockAds: false,
    })

    const mockDOMElem = {
      setAttribute: jest.fn(),
    }
    jest
      .spyOn(window.document, 'getElementById')
      .mockImplementation(jest.fn(() => mockDOMElem))
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    jest.advanceTimersByTime(3e3) // there's a built-in delay for mock ads
    expect(mockDOMElem.setAttribute).not.toHaveBeenCalled()
  })

  it('queues the command to call googleDisplayAd until the config has been set', () => {
    const { setConfig } = require('src/config')

    const displayAd = require('src/displayAd').default
    displayAd('some-ad')

    // Waiting on queue.
    expect(mockGoogleDisplayAd).not.toHaveBeenCalled()

    // The queue should run after the config is set.
    setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: false,
      useMockAds: false,
    })
    expect(mockGoogleDisplayAd).toHaveBeenCalledWith('some-ad')
  })
})
