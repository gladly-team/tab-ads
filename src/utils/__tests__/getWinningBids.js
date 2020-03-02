/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import {
  mockGoogleTagSlotRenderEndedData,
  getMockTabAdsUserConfig,
} from 'src/utils/test-utils'
import { getConfig, setConfig } from 'src/config'
import BidResponse from 'src/utils/BidResponse'
import { storeA } from 'src/utils/test-fixtures'

const getMockBidderStoredData = () => {
  const { newTabAds } = getConfig()
  return {
    bidResponses: {
      [newTabAds.leaderboard.adId]: [],
      [newTabAds.rectangleAdPrimary.adId]: [],
      [newTabAds.rectangleAdSecondary.adId]: [],
    },
    rawBidResponses: [{}, {}, {}], // not relevant to testing this module
    includedInAdRequest: true,
  }
}

// Set up a store with example bid responses from our bidders.
const setUpStoreWithBidders = () => {
  const store = getAdDataStore()
  store.bidResponses = {
    amazon: getMockBidderStoredData(),
    indexExchange: getMockBidderStoredData(),
    prebid: getMockBidderStoredData(),
  }
}

beforeEach(() => {
  setConfig(getMockTabAdsUserConfig())
})

afterEach(() => {
  jest.clearAllMocks()
  clearAdDataStore()
})

describe('getWinningBids: getWinningBidForAd', () => {
  it('returns the expected winning DisplayedAdInfo when all bidders have bids', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0031,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.02024,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.02024,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })

  it('returns the expected winning DisplayedAdInfo when no bidders have bids', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId] = []
    store.bidResponses.indexExchange.bidResponses[adId] = []
    store.bidResponses.prebid.bidResponses[adId] = []

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toBeNull()
  })

  it('returns the expected winning DisplayedAdInfo when we have bids from some bidders but not others', () => {
    const mockGAMAdvertiserId = 246810
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange = undefined // no bids
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.1231,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.00012,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.1231,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })

  it('returns the expected winning DisplayedAdInfo when we do not have any encodedRevenue values', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses = undefined // no encodedRevenue values
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0031,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.02024,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.02024,
      encodedRevenue: null,
      adSize: '728x90',
    })
  })

  it('returns the expected winning DisplayedAdInfo when we only have an encodedRevenue bid', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-cool-encoded-revenue',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses = undefined
    store.bidResponses.prebid.bidResponses = undefined

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: null,
      encodedRevenue: 'some-cool-encoded-revenue',
      adSize: '728x90',
    })
  })

  it('excludes bids that did not respond in time to be included in the ad server request', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )

    // This bid would normally win, but it did not respond in time.
    store.bidResponses.indexExchange.includedInAdRequest = false // did not respond in time
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.831,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )

    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.032,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.0014,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.032,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })

  it('excludes all bids when none responded in time to be included in the ad server request', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.includedInAdRequest = false // did not respond in time
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )

    store.bidResponses.indexExchange.includedInAdRequest = false // did not respond in time
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.831,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )

    store.bidResponses.prebid.includedInAdRequest = false // did not respond in time
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.032,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.0014,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toBeNull()
  })

  it("returns null if there isn't any stored data for the rendered ad", () => {
    const adId = 'my-ad-id-123'

    // Set up the store.
    const store = getAdDataStore()
    store.adManager.slotsRendered[adId] = undefined

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toBeNull()
  })

  it('uses the default GAM advertiser ID (99) if the slot has a nil GAM advertiser ID value', () => {
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0031,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.02024,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: undefined, // No ID
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: 99,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.02024,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })

  it('uses the default GAM advertiser ID (99) if the slot has a GAM advertiser ID equal to zero', () => {
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0031,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.02024,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: 0, // Blank ID
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: 99,
      GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
      revenue: 0.02024,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })
})

describe('getWinningBids: getAllWinningBids', () => {
  it('returns the expected DisplayedAdInfo by adId', () => {
    const { newTabAds } = getConfig()

    // Set up the store.
    const store = getAdDataStore()
    setUpStoreWithBidders()

    // Set up stored bids for the leaderboard ad.
    store.bidResponses.amazon.bidResponses[newTabAds.leaderboard.adId].push(
      BidResponse({
        adId: newTabAds.leaderboard.adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses[
      newTabAds.leaderboard.adId
    ].push(
      BidResponse({
        adId: newTabAds.leaderboard.adId,
        revenue: 0.0131,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[newTabAds.leaderboard.adId].push(
      BidResponse({
        adId: newTabAds.leaderboard.adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId: newTabAds.leaderboard.adId,
        revenue: 0.00998,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[
      newTabAds.leaderboard.adId
    ] = mockGoogleTagSlotRenderEndedData(
      newTabAds.leaderboard,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: 112233,
      }
    )

    // Set up stored bids for the first rectangle ad.
    store.bidResponses.amazon.bidResponses[
      newTabAds.rectangleAdPrimary.adId
    ] = undefined
    store.bidResponses.indexExchange.bidResponses[
      newTabAds.rectangleAdPrimary.adId
    ].push(
      BidResponse({
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.00842,
        advertiserName: 'indexExchange',
        adSize: '300x250',
      })
    )
    store.bidResponses.prebid.bidResponses[
      newTabAds.rectangleAdPrimary.adId
    ].push(
      BidResponse({
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.00019,
        advertiserName: 'openx',
        adSize: '300x250',
      }),
      BidResponse({
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.016,
        advertiserName: 'sonobi',
        adSize: '300x250',
      }),
      BidResponse({
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.013,
        advertiserName: 'pulsepoint',
        adSize: '300x250',
      })
    )

    // Set that the second rectangle ad was displayed.
    store.adManager.slotsRendered[
      newTabAds.rectangleAdPrimary.adId
    ] = mockGoogleTagSlotRenderEndedData(
      newTabAds.rectangleAdPrimary.adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: 445566,
      }
    )

    // Set up stored bids for the second rectangle ad.
    store.bidResponses.amazon.bidResponses[
      newTabAds.rectangleAdSecondary.adId
    ].push(
      BidResponse({
        adId: newTabAds.leaderboard.adId,
        encodedRevenue: 'some-encoded-revenue-9292',
        advertiserName: 'amazon',
        adSize: '300x250',
      })
    )
    store.bidResponses.indexExchange.bidResponses[
      newTabAds.rectangleAdSecondary.adId
    ].push(
      BidResponse({
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.007,
        advertiserName: 'indexExchange',
        adSize: '300x250',
      })
    )
    store.bidResponses.prebid.bidResponses[
      newTabAds.rectangleAdSecondary.adId
    ].push(
      BidResponse({
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.00029,
        advertiserName: 'openx',
        adSize: '300x250',
      }),
      BidResponse({
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.0011,
        advertiserName: 'sonobi',
        adSize: '300x250',
      }),
      BidResponse({
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.0018,
        advertiserName: 'pulsepoint',
        adSize: '300x250',
      })
    )

    // Set that the second rectangle ad was displayed.
    store.adManager.slotsRendered[
      newTabAds.rectangleAdSecondary.adId
    ] = mockGoogleTagSlotRenderEndedData(
      newTabAds.rectangleAdSecondary.adId,
      '/123456/ThisIsMyAdUnitName/',
      {
        advertiserId: 778899,
      }
    )

    const { getAllWinningBids } = require('src/utils/getWinningBids')
    const allWinningBids = getAllWinningBids()
    expect(allWinningBids).toEqual({
      [newTabAds.leaderboard.adId]: {
        adId: newTabAds.leaderboard.adId,
        revenue: 0.0131,
        GAMAdvertiserId: 112233,
        GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
        encodedRevenue: 'some-encoded-revenue-0101',
        adSize: '728x90',
      },
      [newTabAds.rectangleAdPrimary.adId]: {
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.016,
        GAMAdvertiserId: 445566,
        GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
        encodedRevenue: null,
        adSize: '300x250',
      },
      [newTabAds.rectangleAdSecondary.adId]: {
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.007,
        encodedRevenue: 'some-encoded-revenue-9292',
        GAMAdvertiserId: 778899,
        GAMAdUnitId: '/123456/ThisIsMyAdUnitName/',
        adSize: '300x250',
      },
    })
  })

  it('returns the expected DisplayedAdInfo by for fixtures example storeA', () => {
    const { newTabAds } = getConfig()

    // Set up the store.
    const store = getAdDataStore()
    store.adManager = storeA.adManager
    store.bidResponses = storeA.bidResponses

    const { getAllWinningBids } = require('src/utils/getWinningBids')
    const allWinningBids = getAllWinningBids()
    expect(allWinningBids).toEqual({
      [newTabAds.leaderboard.adId]: {
        adId: newTabAds.leaderboard.adId,
        revenue: 0.000242,
        GAMAdvertiserId: 99,
        GAMAdUnitId: '/43865596/HBTL',
        encodedRevenue: 'abc',
        adSize: '728x90',
      },
      [newTabAds.rectangleAdPrimary.adId]: {
        adId: newTabAds.rectangleAdPrimary.adId,
        revenue: 0.000231,
        GAMAdvertiserId: 99,
        GAMAdUnitId: '/43865596/HBTR',
        encodedRevenue: 'def',
        adSize: '300x250',
      },
      [newTabAds.rectangleAdSecondary.adId]: {
        adId: newTabAds.rectangleAdSecondary.adId,
        revenue: 0.000234,
        encodedRevenue: '2',
        GAMAdvertiserId: 24681357,
        GAMAdUnitId: '/43865596/HBTR2',
        adSize: '300x250',
      },
    })
  })
})
