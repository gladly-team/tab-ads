/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import {
  mockGoogleTagImpressionViewableData,
  mockGoogleTagSlotOnloadData,
  mockGoogleTagSlotRenderEndedData,
} from 'src/utils/test-utils'
import logger from 'src/utils/logger'
import getGoogleTag from 'src/google/getGoogleTag'

jest.mock('src/utils/logger')
jest.mock('src/google/getGoogleTag')

beforeEach(() => {
  delete window.googletag
  clearAdDataStore()

  // Mock googletag
  const mockAddEventListener = jest.fn()
  window.googletag = {
    cmd: [],
    pubads: () => ({
      addEventListener: mockAddEventListener,
    }),
  }

  jest.clearAllMocks()
})

afterAll(() => {
  delete window.googletag
  clearAdDataStore()
})

describe('adDisplayListeners: onAdRendered', () => {
  it('TODO', () => {
    expect(true).toBe(true)
  })
})

describe('adDisplayListeners: setUpAdDisplayListeners', () => {
  it('adds a slot ID to the ad data storage\'s "rendered slots" object when GPT\'s "slotRenderEnded" event is fired', () => {
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

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
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

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
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

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
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

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
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

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
    // Mock GPT's pubads addEventListener so we can fake an event
    const googleEventListenerCalls = {}
    window.googletag
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
    window.googletag.cmd.forEach(cmd => cmd())

    // Mock bad slot event data, which will cause an error.
    const mockBrokenSlotData = { foo: 'bar' }

    const slotOnloadCallback = googleEventListenerCalls.slotOnload[0][1]
    slotOnloadCallback(mockBrokenSlotData)

    expect(logger.error).toHaveBeenCalledWith(
      new TypeError("Cannot read property 'getSlotElementId' of undefined")
    )
  })

  it('logs an error if googletag throws', () => {
    getGoogleTag.mockReturnValueOnce({})

    const { setUpAdDisplayListeners } = require('src/adDisplayListeners')
    setUpAdDisplayListeners()

    expect(logger.error).toHaveBeenCalled()
  })
})
