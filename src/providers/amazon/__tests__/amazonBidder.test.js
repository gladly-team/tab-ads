/* eslint-env jest */

import getAmazonTag, {
  __disableAutomaticBidResponses, // eslint-disable-line import/named
  __runBidsBack, // eslint-disable-line import/named
} from 'src/providers/amazon/getAmazonTag'
import getGoogleTag from 'src/google/getGoogleTag'
import { mockAmazonBidResponse } from 'src/utils/test-utils'
import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import { createConfig } from 'src/config'

jest.mock('src/consentManagement')
jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/utils/logger')

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
    const tabAdsConfig = createConfig()
    await amazonBidder(tabAdsConfig)
  })

  it('calls apstag.init with the expected publisher ID and ad server', async () => {
    expect.assertions(1)
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = createConfig()
    await amazonBidder(tabAdsConfig)

    expect(apstag.init.mock.calls[0][0]).toMatchObject({
      pubID: 'ea374841-51b0-4335-9960-99200427f7c8',
      adServer: 'googletag',
    })
  })

  it('calls apstag.fetchBids', async () => {
    const apstag = getAmazonTag()

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = createConfig()
    await amazonBidder(tabAdsConfig)

    expect(apstag.fetchBids).toHaveBeenCalled()
  })

  it('resolves immediately when we expect the mock to return bids immediately', async () => {
    expect.assertions(1)

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = createConfig()
    const promise = amazonBidder(tabAdsConfig)
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
    const tabAdsConfig = createConfig()
    const promise = amazonBidder(tabAdsConfig)
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

  it('stores Amazon bids for analytics', async () => {
    expect.assertions(4)

    // Mock apstag's `fetchBids` so we can invoke the callback function
    let passedCallback
    window.apstag.fetchBids.mockImplementation((config, callback) => {
      passedCallback = callback
    })

    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const { storeAmazonBids } = require('src/providers/amazon/amazonBidder')
    const tabAdsConfig = createConfig()
    amazonBidder(tabAdsConfig)

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

    const adDataStore = getAdDataStore()

    // Should not have stored the bids yet.
    expect(adDataStore.amazonBids['div-gpt-ad-123456789-0']).toBeUndefined()
    expect(adDataStore.amazonBids['div-gpt-ad-24681357-0']).toBeUndefined()

    storeAmazonBids()

    // Now should have stored the bids.
    expect(adDataStore.amazonBids['div-gpt-ad-123456789-0']).toEqual(someBid)
    expect(adDataStore.amazonBids['div-gpt-ad-24681357-0']).toEqual(
      someOtherBid
    )
  })

  it('gets the expected bids when all ads are enabled', async () => {
    const apstag = getAmazonTag()
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const tabAdsConfig = createConfig()
    await amazonBidder(tabAdsConfig)
    expect(apstag.fetchBids).toHaveBeenCalled()
    expect(apstag.fetchBids.mock.calls[0][0]).toMatchObject({
      slots: [
        {
          slotID: 'div-gpt-ad-1464385677836-0',
          sizes: [[728, 90]],
        },
        {
          slotID: 'div-gpt-ad-1464385742501-0',
          sizes: [[300, 250]],
        },
        {
          slotID: 'div-gpt-ad-1539903223131-0',
          sizes: [[300, 250]],
        },
      ],
    })
  })
})
