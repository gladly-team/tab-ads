/* eslint-env jest */
import getGoogleTag, { __setPubadsRefreshMock } from 'src/google/getGoogleTag' // eslint-disable-line import/named
import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import { setConfig } from 'src/config'

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
  // Mock apstag
  delete window.apstag
  window.apstag = getAmazonTag()

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
  delete window.apstag
})

describe('fetchds', () => {
  it('sets up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledTimes(1)
  })

  it('passes the config when setting up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    expect(setUpGoogleAds).toHaveBeenCalledWith(tabAdsConfig)
  })

  it('calls the expected bidders and ad server', async () => {
    expect.assertions(4)

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(amazonBidder).toHaveBeenCalledTimes(1)
    expect(prebidBidder.fetchBids).toHaveBeenCalledTimes(1)
    expect(indexExchangeBidder).toHaveBeenCalledTimes(1)
    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('does not call expected bidders or ad server when ads are not enabled', async () => {
    expect.assertions(4)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig({
      disableAds: true, // Turn off ads
    })
    await fetchAds(tabAdsConfig)

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(amazonBidder).not.toHaveBeenCalled()
    expect(prebidBidder.fetchBids).not.toHaveBeenCalled()
    expect(indexExchangeBidder).not.toHaveBeenCalledTimes(1)
    expect(googletagMockRefresh).not.toHaveBeenCalled()
  })

  it('sets ad server targeting before calling the ad server', async () => {
    expect.assertions(2)
    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    await new Promise(resolve => setImmediate(resolve))

    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    expect(prebidBidder.setTargeting).toHaveBeenCalledTimes(1)

    // TODO: test Amazon targeting
    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server even when all bidders time out', async () => {
    expect.assertions(2)

    // Mock that Prebid is very slow to respond
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    prebidBidder.fetchBids.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    // Mock that Amazon is very slow to respond
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    // Mock that Index Exchange is very slow to respond
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).not.toHaveBeenCalled()

    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server when one bidder times out', async () => {
    expect.assertions(2)

    // Mock that Prebid is very slow to respond
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    prebidBidder.fetchBids.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    // Mock that Amazon responds quickly
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 80)
      })
    })

    // Mock that Index Exchange responds quickly
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 80)
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).not.toHaveBeenCalled()
    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server immediately when all bidders respond before the timeout', async () => {
    expect.assertions(1)

    // Mock that Prebid responds quickly
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    prebidBidder.fetchBids.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    // Mock that Amazon responds quickly
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    // Mock that Index Exchange responds quickly
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(41)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('only calls the ad server once when all bidders respond before the timeout', async () => {
    expect.assertions(2)

    // Mock that Prebid responds quickly
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    prebidBidder.fetchBids.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    // Mock that Amazon responds quickly
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    // Mock that Index Exchange responds quickly
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 40)
      })
    })

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(41)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(20e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls to store Amazon bids for analytics (if Amazon is included in the auction)', async () => {
    expect.assertions(1)
    const { storeAmazonBids } = require('src/providers/amazon/amazonBidder')

    // Mock that Amazon responds quickly
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 80)
      })
    })

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(100)
    await new Promise(resolve => setImmediate(resolve))
    expect(storeAmazonBids).toHaveBeenCalledTimes(1)
  })

  it('does not call to store Amazon bids for analytics (if Amazon is not included in the auction)', async () => {
    expect.assertions(1)
    const { storeAmazonBids } = require('src/providers/amazon/amazonBidder')

    // Mock that Amazon responds slowly
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    amazonBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))
    expect(storeAmazonBids).not.toHaveBeenCalled()
  })

  it('calls to mark IX bids as included in the bid for analytics (if IX is included in the auction)', async () => {
    expect.assertions(1)
    const {
      markIndexExchangeBidsAsIncluded,
    } = require('src/providers/indexExchange/indexExchangeBidder')

    // Mock that IX responds quickly
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 80)
      })
    })

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(100)
    await new Promise(resolve => setImmediate(resolve))
    expect(markIndexExchangeBidsAsIncluded).toHaveBeenCalledTimes(1)
  })

  it('does not call to mark IX bids as included in the bid for analytics (if IX is not included in the auction)', async () => {
    expect.assertions(1)
    const {
      markIndexExchangeBidsAsIncluded,
    } = require('src/providers/indexExchange/indexExchangeBidder')

    // Mock that IX responds quickly
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    indexExchangeBidder.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 15e3)
      })
    })

    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))
    expect(markIndexExchangeBidsAsIncluded).not.toHaveBeenCalled()
  })

  it('calls handleAdsLoaded', async () => {
    expect.assertions(1)
    const handleAdsLoaded = require('src/handleAdsLoaded').default
    const fetchAds = require('src/fetchAds').default
    const tabAdsConfig = setConfig()
    await fetchAds(tabAdsConfig)
    expect(handleAdsLoaded).toHaveBeenCalledTimes(1)
  })
})
