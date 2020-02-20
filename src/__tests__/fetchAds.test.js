/* eslint-env jest */
import fetchAds, { reset } from 'src/fetchAds'
import getGoogleTag, { __setPubadsRefreshMock } from 'src/google/getGoogleTag' // eslint-disable-line import/named
import { setConfig } from 'src/config'
import logger from 'src/utils/logger'
import { getAdDataStore, clearAdDataStore } from 'src/utils/storage'

// Bidders.
import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'
import indexExchangeBidder from 'src/providers/indexExchange/indexExchangeBidder'

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

afterEach(() => {
  jest.clearAllMocks()
  reset()
  clearAdDataStore()
})

// Return an array of active Bidder modules.
const getBidders = () => {
  return [prebidBidder, amazonBidder, indexExchangeBidder]
}

describe('fetchAds: bid and ad server requests', () => {
  it('sets up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledTimes(1)
  })

  it('passes the config when setting up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledWith(tabAdsConfig)
  })

  it('calls the expected bidders', async () => {
    const bidders = getBidders()
    expect.assertions(bidders.length)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

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
    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(handleAdsLoaded).toHaveBeenCalledTimes(1)
  })

  it("calls logger.error when something goes wrong when calling bidders' fetchBids", async () => {
    expect.assertions(1)

    // Mock that the first bidder throws an error
    const bidders = getBidders()
    const mockErr = new Error('Yikes.')
    bidders[0].fetchBids.mockImplementationOnce(() => {
      throw mockErr
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    expect(logger.error).toHaveBeenCalledWith(mockErr)
  })

  it("calls config.onError when something goes wrong when calling bidders' fetchBids", async () => {
    expect.assertions(1)

    // Mock that the first bidder throws an error
    const bidders = getBidders()
    const mockErr = new Error('Yikes.')
    bidders[0].fetchBids.mockImplementationOnce(() => {
      throw mockErr
    })

    const mockOnError = jest.fn()
    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      onError: mockOnError,
    })
    await fetchAds(tabAdsConfig)
    expect(mockOnError).toHaveBeenCalledWith(mockErr)
  })

  it('calls logger.error when something goes wrong when attempting to call the ad server', async () => {
    expect.assertions(1)

    const mockErr = new Error('The Google tag messed up.')
    getGoogleTag.mockImplementationOnce(() => {
      throw mockErr
    })

    const tabAdsConfig = setConfig(getMockTabAdsUserConfig())
    await fetchAds(tabAdsConfig)
    await flushAllPromises()
    expect(logger.error).toHaveBeenCalledWith(mockErr)
  })
})

describe('fetchAds: bid request storage', () => {
  it("stores every bidder's bid response data in storage when they respond quickly", async () => {
    expect.assertions(2)

    const store = getAdDataStore()

    // No bids stored yet.
    expect(store.bidResponses).toEqual({})

    // Mock that all bidders respond quickly.
    const bidders = getBidders()
    bidders.forEach(bidder => {
      bidder.fetchBids.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              bidResponses: {
                example: `Bid responses for ${bidder.name}`,
              },
              rawBidResponses: {
                example: `Raw bid responses for ${bidder.name}`,
              },
            })
          }, 40)
        })
      })
    })

    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      auctionTimeout: 2000,
    })
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(41)
    await flushAllPromises()

    expect(store.bidResponses).toEqual({
      amazon: {
        bidResponses: {
          example: 'Bid responses for amazon',
        },
        includedInAdRequest: true,
        rawBidResponses: {
          example: 'Raw bid responses for amazon',
        },
      },
      indexExchange: {
        bidResponses: {
          example: 'Bid responses for indexExchange',
        },
        includedInAdRequest: true,
        rawBidResponses: {
          example: 'Raw bid responses for indexExchange',
        },
      },
      prebid: {
        bidResponses: {
          example: 'Bid responses for prebid',
        },
        includedInAdRequest: true,
        rawBidResponses: {
          example: 'Raw bid responses for prebid',
        },
      },
    })
  })

  it("stores every bidder's bid response data in storage even when they respond slowly, but includedInAdRequest should be false", async () => {
    expect.assertions(2)

    const store = getAdDataStore()

    // No bids stored yet.
    expect(store.bidResponses).toEqual({})

    // Mock that all bidders respond quickly.
    const bidders = getBidders()
    bidders.forEach(bidder => {
      bidder.fetchBids.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              bidResponses: {
                example: `Bid responses for ${bidder.name}`,
              },
              rawBidResponses: {
                example: `Raw bid responses for ${bidder.name}`,
              },
            })
          }, 15e3) // returns after the ad server request is sent
        })
      })
    })

    const tabAdsConfig = setConfig({
      ...getMockTabAdsUserConfig(),
      auctionTimeout: 2000,
    })
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(20e3)
    await flushAllPromises()

    expect(store.bidResponses).toEqual({
      amazon: {
        bidResponses: {
          example: 'Bid responses for amazon',
        },
        includedInAdRequest: false,
        rawBidResponses: {
          example: 'Raw bid responses for amazon',
        },
      },
      indexExchange: {
        bidResponses: {
          example: 'Bid responses for indexExchange',
        },
        includedInAdRequest: false,
        rawBidResponses: {
          example: 'Raw bid responses for indexExchange',
        },
      },
      prebid: {
        bidResponses: {
          example: 'Bid responses for prebid',
        },
        includedInAdRequest: false,
        rawBidResponses: {
          example: 'Raw bid responses for prebid',
        },
      },
    })
  })
})
