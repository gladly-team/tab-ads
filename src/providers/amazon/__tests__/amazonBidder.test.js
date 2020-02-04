/* eslint-env jest */

import getAmazonTag, {
  __disableAutomaticBidResponses, // eslint-disable-line import/named
  __runBidsBack, // eslint-disable-line import/named
} from 'src/providers/amazon/getAmazonTag'
import getGoogleTag from 'src/google/getGoogleTag'
import { mockAmazonBidResponse } from 'src/utils/test-utils'
import { getNumberOfAdsToShow } from 'src/adSettings'
import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'

jest.mock('js/ads/adSettings')
jest.mock('js/ads/consentManagement')
jest.mock('js/ads/amazon/getAmazonTag')

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
})

afterAll(() => {
  delete window.googletag
  delete window.apstag
  clearAdDataStore()
})

describe('amazonBidder', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', async () => {
    expect.assertions(0)
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
  })

  it('calls apstag.init with the expected publisher ID and ad server', async () => {
    expect.assertions(1)
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()

    expect(apstag.init.mock.calls[0][0]).toMatchObject({
      pubID: 'ea374841-51b0-4335-9960-99200427f7c8',
      adServer: 'googletag',
    })
  })

  it('calls apstag.fetchBids', async () => {
    getNumberOfAdsToShow.mockReturnValue(2)
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()

    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-24682468-0',
          sizes: [[728, 90]],
        },
        {
          slotID: 'div-gpt-ad-1357913579-0',
          sizes: [[300, 250]],
        },
      ],
      timeout: 700,
    })
  })

  it('uses ad sizes provided by the ads settings', async () => {
    getNumberOfAdsToShow.mockReturnValue(2)
    const apstag = getAmazonTag()
    const {
      getVerticalAdSizes,
      getHorizontalAdSizes,
    } = require('src/adSettings')
    getVerticalAdSizes.mockReturnValueOnce([
      [250, 250],
      [300, 600],
    ])
    getHorizontalAdSizes.mockReturnValueOnce([
      [728, 90],
      [720, 300],
    ])

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-24682468-0',
          sizes: [
            [728, 90],
            [720, 300],
          ],
        },
        {
          slotID: 'div-gpt-ad-1357913579-0',
          sizes: [
            [250, 250],
            [300, 600],
          ],
        },
      ],
      timeout: 700,
    })
  })

  it('resolves immediately when we expect the mock to return bids immediately', async () => {
    expect.assertions(1)

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const promise = amazonBidder()
    promise.done = false
    promise.then(() => {
      promise.done = true
    })

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))
    expect(promise.done).toBe(true)
  })

  it('only resolves after the auction ends', async () => {
    expect.assertions(2)
    __disableAutomaticBidResponses()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const promise = amazonBidder()
    promise.done = false
    promise.then(() => {
      promise.done = true
    })

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(promise.done).toBe(false)
    __runBidsBack()

    // Flush all promises
    await new Promise(resolve => setImmediate(resolve))

    expect(promise.done).toBe(true)
  })

  it('stores Amazon bids in tabforacause window variable', async () => {
    expect.assertions(4)

    // Mock apstag's `fetchBids` so we can invoke the callback function
    let passedCallback
    window.apstag.fetchBids.mockImplementation((config, callback) => {
      passedCallback = callback
    })

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const { storeAmazonBids } = require('src/providers/amazon/amazonBidder')
    amazonBidder()

    // Fake that apstag calls callback for returned bids
    const someBid = mockAmazonBidResponse({
      amznbid: 'some-id',
      slotID: 'div-gpt-ad-123456789-0',
    })
    const someOtherBid = mockAmazonBidResponse({
      amznbid: 'some-other-id',
      slotID: 'div-gpt-ad-24681357-0',
    })
    passedCallback([someBid, someOtherBid])

    const tabGlobal = getAdDataStore()

    // Should not have stored the bids yet.
    expect(tabGlobal.ads.amazonBids['div-gpt-ad-123456789-0']).toBeUndefined()
    expect(tabGlobal.ads.amazonBids['div-gpt-ad-24681357-0']).toBeUndefined()

    storeAmazonBids()

    // Now should have stored the bids.
    expect(tabGlobal.ads.amazonBids['div-gpt-ad-123456789-0']).toEqual(someBid)
    expect(tabGlobal.ads.amazonBids['div-gpt-ad-24681357-0']).toEqual(
      someOtherBid
    )
  })

  it('does not call apstag.fetchBids when zero ads are enabled', async () => {
    getNumberOfAdsToShow.mockReturnValue(0)
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
    expect(apstag.fetchBids).not.toHaveBeenCalled()
  })

  it('only gets bids for the leaderboard ad when one ad is enabled', async () => {
    getNumberOfAdsToShow.mockReturnValue(1)
    const {
      getVerticalAdSizes,
      getHorizontalAdSizes,
    } = require('src/adSettings')
    getVerticalAdSizes.mockReturnValue([[300, 250]])
    getHorizontalAdSizes.mockReturnValue([[728, 90]])
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-24682468-0',
          sizes: [[728, 90]],
        },
      ],
    })
  })

  it('gets bids for the leaderboard and rectangle ads when two ads are enabled', async () => {
    getNumberOfAdsToShow.mockReturnValue(2)
    const apstag = getAmazonTag()
    const {
      getVerticalAdSizes,
      getHorizontalAdSizes,
    } = require('src/adSettings')
    getVerticalAdSizes.mockReturnValue([[300, 250]])
    getHorizontalAdSizes.mockReturnValue([[728, 90]])
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-24682468-0',
          sizes: [[728, 90]],
        },
        {
          slotID: 'div-gpt-ad-1357913579-0',
          sizes: [[300, 250]],
        },
      ],
    })
  })

  it('gets bids for the leaderboard and rectangle ads when three ads are enabled', async () => {
    getNumberOfAdsToShow.mockReturnValue(3)
    const apstag = getAmazonTag()
    const {
      getVerticalAdSizes,
      getHorizontalAdSizes,
    } = require('src/adSettings')
    getVerticalAdSizes.mockReturnValue([[300, 250]])
    getHorizontalAdSizes.mockReturnValue([[728, 90]])
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    await amazonBidder()
    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-24682468-0',
          sizes: [[728, 90]],
        },
        {
          slotID: 'div-gpt-ad-1357913579-0',
          sizes: [[300, 250]],
        },
        {
          slotID: 'div-gpt-ad-11235813-0',
          sizes: [[300, 250]],
        },
      ],
    })
  })
})
