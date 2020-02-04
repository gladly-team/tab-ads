/* eslint-env jest */
import getGoogleTag, { __setPubadsRefreshMock } from 'src/google/getGoogleTag' // eslint-disable-line import/named
import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'

jest.mock('src/providers/prebid/built/pb')
jest.mock('src/google/getGoogleTag')
jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/providers/prebid/getPrebidPbjs')
jest.mock('src/providers/prebid/prebidConfig')
jest.mock('src/providers/amazon/amazonBidder')
jest.mock('src/providers/indexExchange/indexExchangeBidder')
jest.mock('src/handleAdsLoaded')
jest.mock('src/adsEnabledStatus')
jest.mock('src/google/setUpGoogleAds')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  // Enable ads by default.
  const adsEnabledStatus = require('src/adsEnabledStatus').default
  adsEnabledStatus.mockReturnValue(true)

  // Mock apstag
  delete window.apstag
  window.apstag = getAmazonTag()

  // Mock Prebid global
  delete window.pbjs
  window.pbjs = getPrebidPbjs()

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
  delete window.pbjs
})

describe('ads script', () => {
  it('sets up the Google ad slots', async () => {
    expect.assertions(1)
    const setUpGoogleAds = require('src/google/setUpGoogleAds').default
    require('src/ads')
    expect(setUpGoogleAds).toHaveBeenCalledTimes(1)
  })

  it('calls the expected bidders and ad server', async () => {
    expect.assertions(4)

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    require('src/ads')

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(amazonBidder).toHaveBeenCalledTimes(1)
    expect(prebidConfig).toHaveBeenCalledTimes(1)
    expect(indexExchangeBidder).toHaveBeenCalledTimes(1)
    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('does not call expected bidders or ad server when ads are not enabled', async () => {
    expect.assertions(4)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default

    // Disable ads.
    const adsEnabledStatus = require('src/adsEnabledStatus').default
    adsEnabledStatus.mockReturnValue(false)

    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    require('src/ads')

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(amazonBidder).not.toHaveBeenCalled()
    expect(prebidConfig).not.toHaveBeenCalled()
    expect(indexExchangeBidder).not.toHaveBeenCalledTimes(1)
    expect(googletagMockRefresh).not.toHaveBeenCalled()
  })

  it('sets ad server targeting before calling the ad server', async () => {
    expect.assertions(3)
    const googletagMockRefresh = jest.fn()
    __setPubadsRefreshMock(googletagMockRefresh)

    require('src/ads')
    await new Promise(resolve => setImmediate(resolve))

    expect(window.pbjs.setTargetingForGPTAsync).toHaveBeenCalledTimes(1)
    expect(window.pbjs.setTargetingForGPTAsync).toHaveBeenCalledTimes(1)
    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server even when all bidders time out', async () => {
    expect.assertions(2)

    // Mock that Prebid is very slow to respond
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    prebidConfig.mockImplementationOnce(() => {
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

    require('src/ads')
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).not.toHaveBeenCalled()

    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server when one bidder times out', async () => {
    expect.assertions(2)

    // Mock that Prebid is very slow to respond
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    prebidConfig.mockImplementationOnce(() => {
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

    require('src/ads')
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).not.toHaveBeenCalled()
    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls the ad server immediately when all bidders respond before the timeout', async () => {
    expect.assertions(1)

    // Mock that Prebid responds quickly
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    prebidConfig.mockImplementationOnce(() => {
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

    require('src/ads')
    jest.advanceTimersByTime(41)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('only calls the ad server once when all bidders respond before the timeout', async () => {
    expect.assertions(2)

    // Mock that Prebid responds quickly
    const prebidConfig = require('src/providers/prebid/prebidConfig').default
    prebidConfig.mockImplementationOnce(() => {
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

    require('src/ads')
    jest.advanceTimersByTime(41)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(20e3)
    await new Promise(resolve => setImmediate(resolve))

    expect(googletagMockRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls to store Amazon bids on the window for analytics (if Amazon is included in the auction)', async () => {
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

    require('src/ads')
    jest.advanceTimersByTime(100)
    await new Promise(resolve => setImmediate(resolve))
    expect(storeAmazonBids).toHaveBeenCalledTimes(1)
  })

  it('does not call to store Amazon bids on the window for analytics (if Amazon is not included in the auction)', async () => {
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

    require('src/ads')
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

    require('src/ads')
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

    require('src/ads')
    jest.advanceTimersByTime(3e3)
    await new Promise(resolve => setImmediate(resolve))
    expect(markIndexExchangeBidsAsIncluded).not.toHaveBeenCalled()
  })

  it('calls handleAdsLoaded', async () => {
    expect.assertions(1)
    const handleAdsLoaded = require('src/handleAdsLoaded').default
    require('src/ads')
    expect(handleAdsLoaded).toHaveBeenCalledTimes(1)
  })
})
