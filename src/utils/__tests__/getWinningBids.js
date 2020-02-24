/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import { mockGoogleTagSlotRenderEndedData } from 'src/utils/test-utils'

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  clearAdDataStore()
})

describe('getWinningBids: getWinningBidForAd', () => {
  it('returns the expected DisplayedAdInfo', () => {
    const adId = 'my-ad-id-123'
    const mockGAMAdvertiserId = 112233

    // Set up the store.
    const store = getAdDataStore()
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/some-ad/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      revenue: 0.23,
      encodedRevenue: 'abc-123',
      adSize: '728x90',
    })
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
})
