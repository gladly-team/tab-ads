/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import {
  mockGoogleTagImpressionViewableData,
  mockGoogleTagSlotOnloadData,
  mockGoogleTagSlotRenderEndedData,
} from 'src/utils/test-utils'

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
  jest.resetModules()
})

afterAll(() => {
  delete window.googletag
  clearAdDataStore()
})

describe('handleAdsLoaded', () => {
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

    const handleAdsLoaded = require('src/handleAdsLoaded').default
    handleAdsLoaded()

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
    expect(adDataStore.slotsRendered[slotId]).toBe(mockSlotRenderEventData)

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotRenderEventData = mockGoogleTagSlotRenderEndedData(
      otherSlotId
    )
    expect(adDataStore.slotsRendered[otherSlotId]).toBeUndefined()
    slotRenderEndedEventCallback(otherMockSlotRenderEventData)
    expect(adDataStore.slotsRendered[otherSlotId]).toBe(
      otherMockSlotRenderEventData
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

    const handleAdsLoaded = require('src/handleAdsLoaded').default
    handleAdsLoaded()

    // Run the queued googletag commands
    window.googletag.cmd.forEach(cmd => cmd())

    // Fake the event callback
    const slotId = 'abc-123'
    const mockSlotLoadEventData = mockGoogleTagImpressionViewableData(slotId)
    const slotRenderEndedEventCallback =
      googleEventListenerCalls.impressionViewable[0][1]
    slotRenderEndedEventCallback(mockSlotLoadEventData)

    // Check that we're using the expected GPT event
    expect(googleEventListenerCalls.impressionViewable[0][0]).toEqual(
      'impressionViewable'
    )

    // Make sure we've marked the slot as loaded
    const adDataStore = getAdDataStore()
    expect(adDataStore.slotsViewable[slotId]).toBe(true)

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotLoadEventData = mockGoogleTagImpressionViewableData(
      otherSlotId
    )
    expect(adDataStore.slotsViewable[otherSlotId]).toBeUndefined()
    slotRenderEndedEventCallback(otherMockSlotLoadEventData)
    expect(adDataStore.slotsViewable[otherSlotId]).toBe(true)
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

    const handleAdsLoaded = require('src/handleAdsLoaded').default
    handleAdsLoaded()

    // Run the queued googletag commands
    window.googletag.cmd.forEach(cmd => cmd())

    // Fake the event callback
    const slotId = 'abc-123'
    const mockSlotLoadEventData = mockGoogleTagSlotOnloadData(slotId)
    const slotRenderEndedEventCallback =
      googleEventListenerCalls.slotOnload[0][1]
    slotRenderEndedEventCallback(mockSlotLoadEventData)

    // Check that we're using the expected GPT event
    expect(googleEventListenerCalls.slotOnload[0][0]).toEqual('slotOnload')

    // Make sure we've marked the slot as loaded
    const adDataStore = getAdDataStore()
    expect(adDataStore.slotsLoaded[slotId]).toBe(true)

    // Make sure it works multiple times
    const otherSlotId = 'xyz-987'
    const otherMockSlotLoadEventData = mockGoogleTagSlotOnloadData(otherSlotId)
    expect(adDataStore.slotsLoaded[otherSlotId]).toBeUndefined()
    slotRenderEndedEventCallback(otherMockSlotLoadEventData)
    expect(adDataStore.slotsLoaded[otherSlotId]).toBe(true)
  })
})
