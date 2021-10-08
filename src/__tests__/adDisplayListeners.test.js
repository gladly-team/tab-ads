/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import {
  mockGoogleTagImpressionViewableData,
  mockGoogleTagSlotOnloadData,
  mockGoogleTagSlotRenderEndedData,
} from 'src/utils/test-utils'

jest.mock('src/utils/logger')
jest.mock('src/google/getGoogleTag')
jest.mock('src/utils/getWinningBids')

beforeEach(() => {
  clearAdDataStore()

  // Mock googletag
  const mockAddEventListener = jest.fn()
  const getGoogleTag = require('src/google/getGoogleTag').default
  const googletag = getGoogleTag()
  googletag.pubads = () => ({
    addEventListener: mockAddEventListener,
  })

  jest.clearAllMocks()
})

afterEach(() => {
  jest.resetModules()
})

afterAll(() => {
  clearAdDataStore()
})

const runMockSlotRenderEndedEventForAd = (adId) => {
  // Mock GPT's pubads addEventListener so we can fake an event
  const getGoogleTag = require('src/google/getGoogleTag').default
  const googletag = getGoogleTag()
  const googleEventListenerCalls = {}
  googletag
    .pubads()
    .addEventListener.mockImplementation((eventName, callback) => {
      if (!googleEventListenerCalls[eventName]) {
        googleEventListenerCalls[eventName] = []
      }
      googleEventListenerCalls[eventName].push([eventName, callback])
    })

  const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
  setUpAdDisplayListeners()

  // Run the queued googletag commands
  googletag.cmd.forEach((cmd) => cmd())

  // Fake the event callback
  const mockSlotRenderEventData = mockGoogleTagSlotRenderEndedData(adId)
  const slotRenderEndedEventCallback =
    googleEventListenerCalls.slotRenderEnded[0][1]
  slotRenderEndedEventCallback(mockSlotRenderEventData)
}

describe('adDisplayListeners: onAdRendered', () => {
  it('immediately calls the callback if the ad has already rendered', () =>
    new Promise((resolve, reject) => {
      const { onAdRendered } = require('src/adDisplayListeners')

      // Simulate that the "slot render ended" event has already occurred
      // for this ad.
      const adId = 'abc-123'
      runMockSlotRenderEndedEventForAd(adId)

      const { getWinningBidForAd } = require('src/utils/getWinningBids')
      const expectedMockWinningSlot = getWinningBidForAd(adId)
      onAdRendered(adId, (adData) => {
        try {
          expect(adData).toEqual(expectedMockWinningSlot)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))

  it('calls the callback when the ad renders later', () =>
    new Promise((resolve, reject) => {
      const { onAdRendered } = require('src/adDisplayListeners')

      const adId = 'xyz-987'
      const { getWinningBidForAd } = require('src/utils/getWinningBids')
      const expectedMockWinningSlot = getWinningBidForAd(adId)
      onAdRendered(adId, (adData) => {
        try {
          expect(adData).toEqual(expectedMockWinningSlot)
          resolve()
        } catch (e) {
          reject(e)
        }
      })

      // The ad renders after the callback is registered.
      runMockSlotRenderEndedEventForAd(adId)
    }))

  it('calls multiple callbacks when the ad renders', () => {
    const numCallbacks = 2
    expect.assertions(numCallbacks)
    return new Promise((resolve, reject) => {
      const { onAdRendered } = require('src/adDisplayListeners')

      let completedCallbacks = 0
      const complete = (err) => {
        if (err) {
          reject(err)
        }
        completedCallbacks += 1
        if (completedCallbacks === numCallbacks) {
          resolve()
        }
      }

      const adId = 'def-246'
      const { getWinningBidForAd } = require('src/utils/getWinningBids')
      const expectedMockWinningSlot = getWinningBidForAd(adId)
      onAdRendered(adId, (adData) => {
        try {
          expect(adData).toEqual(expectedMockWinningSlot)
          complete()
        } catch (e) {
          complete(e)
        }
      })
      onAdRendered(adId, (adData) => {
        try {
          expect(adData).toEqual(expectedMockWinningSlot)
          complete()
        } catch (e) {
          complete(e)
        }
      })

      // The ad renders after the callback is registered.
      runMockSlotRenderEndedEventForAd(adId)
    })
  })

  it('calls getWinningBidForAd with the expected ad ID', () =>
    new Promise((resolve, reject) => {
      const { onAdRendered } = require('src/adDisplayListeners')

      const adId = 'my-special-ad'
      const { getWinningBidForAd } = require('src/utils/getWinningBids')
      onAdRendered(adId, () => {
        try {
          expect(getWinningBidForAd).toHaveBeenCalledTimes(1)
          expect(getWinningBidForAd).toHaveBeenCalledWith('my-special-ad')
          resolve()
        } catch (e) {
          reject(e)
        }
      })
      runMockSlotRenderEndedEventForAd(adId)
    }))
})

describe('adDisplayListeners: setUpAdDisplayListeners', () => {
  it('adds a slot ID to the ad data storage\'s "rendered slots" object when GPT\'s "slotRenderEnded" event is fired', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Fake the event callback
    const slotId = 'abc-123'
    const mockSlotRenderEventData = mockGoogleTagSlotRenderEndedData(slotId)
    const slotRenderEndedEventCallback =
      googleEventListenerCalls.slotRenderEnded[0][1]
    slotRenderEndedEventCallback(mockSlotRenderEventData)

    // Check that we're using the expected GPT event
    expect(googleEventListenerCalls.slotRenderEnded[0][0]).toEqual(
      'slotRenderEnded'
    )

    // Make sure we've marked the slot as loaded
    const adDataStore = getAdDataStore()
    expect(adDataStore.adManager.slotsRendered[slotId]).toBe(
      mockSlotRenderEventData
    )

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotRenderEventData = mockGoogleTagSlotRenderEndedData(
      otherSlotId
    )
    expect(adDataStore.adManager.slotsRendered[otherSlotId]).toBeUndefined()
    slotRenderEndedEventCallback(otherMockSlotRenderEventData)
    expect(adDataStore.adManager.slotsRendered[otherSlotId]).toBe(
      otherMockSlotRenderEventData
    )

    // There should not be any error logs.
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs an error when we fail to store GPT\'s "slotRenderEnded" event', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Mock bad slot event data, which will cause an error.
    const mockBrokenSlotData = { foo: 'bar' }

    const slotRenderEndedEventCallback =
      googleEventListenerCalls.slotRenderEnded[0][1]
    slotRenderEndedEventCallback(mockBrokenSlotData)

    expect(logger.error).toHaveBeenCalledWith(
      new TypeError("Cannot read property 'getSlotElementId' of undefined")
    )
  })

  it('marks a slot as loaded on the ad data storage\'s "viewable slots" object when GPT\'s "impressionViewable" event is fired', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Fake the event callback
    const slotId = 'abc-123'
    const mockSlotLoadEventData = mockGoogleTagImpressionViewableData(slotId)
    const impressionViewableCallback =
      googleEventListenerCalls.impressionViewable[0][1]
    impressionViewableCallback(mockSlotLoadEventData)

    // Check that we're using the expected GPT event
    expect(googleEventListenerCalls.impressionViewable[0][0]).toEqual(
      'impressionViewable'
    )

    // Make sure we've marked the slot as loaded
    const adDataStore = getAdDataStore()
    expect(adDataStore.adManager.slotsViewable[slotId]).toBe(true)

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotLoadEventData = mockGoogleTagImpressionViewableData(
      otherSlotId
    )
    expect(adDataStore.adManager.slotsViewable[otherSlotId]).toBeUndefined()
    impressionViewableCallback(otherMockSlotLoadEventData)
    expect(adDataStore.adManager.slotsViewable[otherSlotId]).toBe(true)

    // There should not be any error logs.
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs an error when we fail to store GPT\'s "impressionViewable" event', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Mock bad slot event data, which will cause an error.
    const mockBrokenSlotData = { foo: 'bar' }

    const impressionViewableCallback =
      googleEventListenerCalls.impressionViewable[0][1]
    impressionViewableCallback(mockBrokenSlotData)

    expect(logger.error).toHaveBeenCalledWith(
      new TypeError("Cannot read property 'getSlotElementId' of undefined")
    )
  })

  it('marks a slot as loaded on the ad data storage\'s "loaded slots" object when GPT\'s "slotOnload" event is fired', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Fake the event callback
    const slotId = 'abc-123'
    const mockSlotLoadEventData = mockGoogleTagSlotOnloadData(slotId)
    const slotOnloadCallback = googleEventListenerCalls.slotOnload[0][1]
    slotOnloadCallback(mockSlotLoadEventData)

    // Check that we're using the expected GPT event
    expect(googleEventListenerCalls.slotOnload[0][0]).toEqual('slotOnload')

    // Make sure we've marked the slot as loaded
    const adDataStore = getAdDataStore()
    expect(adDataStore.adManager.slotsLoaded[slotId]).toBe(true)

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotLoadEventData = mockGoogleTagSlotOnloadData(otherSlotId)
    expect(adDataStore.adManager.slotsLoaded[otherSlotId]).toBeUndefined()
    slotOnloadCallback(otherMockSlotLoadEventData)
    expect(adDataStore.adManager.slotsLoaded[otherSlotId]).toBe(true)

    // There should not be any error logs.
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs an error when we fail to store GPT\'s "slotOnload" event', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    const googletag = getGoogleTag()

    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    googletag
      .pubads()
      .addEventListener.mockImplementation((eventName, callback) => {
        if (!googleEventListenerCalls[eventName]) {
          googleEventListenerCalls[eventName] = []
        }
        googleEventListenerCalls[eventName].push([eventName, callback])
      })

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    // Run the queued googletag commands
    googletag.cmd.forEach((cmd) => cmd())

    // Mock bad slot event data, which will cause an error.
    const mockBrokenSlotData = { foo: 'bar' }

    const slotOnloadCallback = googleEventListenerCalls.slotOnload[0][1]
    slotOnloadCallback(mockBrokenSlotData)

    expect(logger.error).toHaveBeenCalledWith(
      new TypeError("Cannot read property 'getSlotElementId' of undefined")
    )
  })

  it('logs an error if googletag throws', () => {
    const logger = require('src/utils/logger').default
    const getGoogleTag = require('src/google/getGoogleTag').default
    getGoogleTag.mockReturnValueOnce({})

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    expect(logger.error).toHaveBeenCalled()
  })
})
