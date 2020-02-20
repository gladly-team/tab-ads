/* eslint-env jest */
import getGoogleTag, { __setPubadsRefreshMock } from 'src/google/getGoogleTag' // eslint-disable-line import/named
import { setConfig } from 'src/config'
import { flushAllPromises, getMockTabAdsUserConfig } from 'src/utils/test-utils'

jest.mock('src/google/getGoogleTag')
jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/providers/prebid/prebidBidder')
jest.mock('src/providers/amazon/amazonBidder')
jest.mock('src/providers/indexExchange/indexExchangeBidder')
jest.mock('src/handleAdsLoaded')
jest.mock('src/google/setUpGoogleAds')
jest.mock('src/utils/logger')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  // Set up googletag
  delete window.googletag
  window.googletag = getGoogleTag()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

afterAll(() => {
  delete window.googletag
})

// Return an array of Bidder modules.
const getBidders = () => {
  const amazonBidder = require('src/providers/amazon/amazonBidder').default
  const prebidBidder = require('src/providers/prebid/prebidBidder').default
  const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
    .default
  return [prebidBidder, amazonBidder, indexExchangeBidder]
}

describe('fetchAds', () => {
  it('sets up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledTimes(1)
  })

  it('passes the config when setting up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledWith(tabAdsConfig)
  })

  it('calls the expected bidders', async () => {
    const bidders = getBidders()
    expect.assertions(bidders.length)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await flushAllPromises()

    bidders.forEach(bidder => {
      expect(bidder.fetchBids).toHaveBeenCalledTimes(1)
    })
  })

  it('calls the ad server', async () => {
    expect.assertions(1)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('does not call the expected bidders when ads are not enabled', async () => {
    const bidders = getBidders()
    expect.assertions(bidders.length)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true, // Turn off ads
    })
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await flushAllPromises()

    bidders.forEach(bidder => {
      expect(bidder.fetchBids).not.toHaveBeenCalled()
    })
  })

  it('does not call the ad server when ads are not enabled', async () => {
    expect.assertions(1)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      disableAds: true, // Turn off ads
    })
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await flushAllPromises()

    expect(googletagMockRefresh).not.toHaveBeenCalled()
  })

  it('sets ad server targeting on all bidders', async () => {
    const bidders = getBidders()
    expect.assertions(bidders.length)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    await flushAllPromises()

    bidders.forEach(bidder => {
      expect(bidder.setTargeting).toHaveBeenCalledTimes(1)
    })
  })

  it('calls the ad server even when all bidders time out', async () => {
    expect.assertions(2)

    // Mock that all bidders are very slow to respond.
    const bidders = getBidders()
    bidders.forEach(bidder => {
      bidder.fetchBids.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 15e3)
        })
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    await flushAllPromises()

    expect(googletagMockRefresh).not.toHaveBeenCalled()

    jest.advanceTimersByTime(3e3)
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server when one bidder times out', async () => {
    expect.assertions(2)

    // Mock that the first bidder is slow to respond.
    const bidders = getBidders()
    bidders.forEach((bidder, index) => {
      bidder.fetchBids.mockImplementationOnce(() => {
        const timeoutMs = index === 0 ? 15e3 : 80
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, timeoutMs)
        })
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    await flushAllPromises()

    expect(googletagMockRefresh).not.toHaveBeenCalled()
    jest.advanceTimersByTime(3e3)
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server immediately when all bidders respond before the timeout', async () => {
    expect.assertions(1)

    // Mock that all bidders respond quickly.
    const bidders = getBidders()
    bidders.forEach(bidder => {
      bidder.fetchBids.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 40)
        })
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(41)
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('only calls the ad server once when all bidders respond before the timeout', async () => {
    expect.assertions(2)

    // Mock that all bidders respond quickly.
    const bidders = getBidders()
    bidders.forEach(bidder => {
      bidder.fetchBids.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 40)
        })
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(41)
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(20e3)
    await flushAllPromises()

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls handleAdsLoaded', async () => {
    expect.assertions(1)
    const handleAdsLoaded = require('src/handleAdsLoaded').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(handleAdsLoaded).toHaveBeenCalledTimes(1)
  })
})
