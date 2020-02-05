/* eslint-env jest */

import { setConfig } from 'src/config'

// By default, we run functions in the queue immediately.
// Call this to disable that.
export const __disableAutomaticCommandQueueExecution = () => {
  window.googletag.cmd = []
}

// Run all functions in googletag.cmd.
export const __runCommandQueue = () => {
  window.googletag.cmd.forEach(cmd => cmd())
}

let mockPubadsRefresh = jest.fn()
const mockEnableSingleRequest = jest.fn()

// Set a mock function for googletag.pubads().refresh.
export const __setPubadsRefreshMock = mockFunction => {
  mockPubadsRefresh = mockFunction
}

const MockSlot = ({ adUnitPath, slotElementId }) => ({
  getAdUnitPath: () => adUnitPath,
  getSlotElementId: () => slotElementId,
  setTargeting: jest.fn(),
})

// FIXME: don't call setConfig here. It could interfere with tests.
const tabAdsConfig = setConfig()
const mockSlots = [
  // Mock ad unit IDs from the adSettings mock.
  // Bottom leaderboard
  MockSlot({
    adUnitPath: tabAdsConfig.newTabAds.leaderboard.adUnitId,
    slotElementId: tabAdsConfig.newTabAds.leaderboard.adId,
  }),
  // First (bottom) rectangle ad
  MockSlot({
    adUnitPath: tabAdsConfig.newTabAds.rectangleAdPrimary.adUnitId,
    slotElementId: tabAdsConfig.newTabAds.rectangleAdPrimary.adId,
  }),
  // Second (top) rectangle ad
  MockSlot({
    adUnitPath: tabAdsConfig.newTabAds.rectangleAdSecondary.adUnitId,
    slotElementId: tabAdsConfig.newTabAds.rectangleAdSecondary.adId,
  }),
]

const mockGetSlots = jest.fn(() => {
  return mockSlots
})
const mockSetTargeting = jest.fn()

const eventListenerStore = {}

// Mock an event fired.
export const __runEventListenerCallbacks = (eventName, ...args) => {
  eventListenerStore[eventName].forEach(f => f(...args))
}

const mockCmd = []
mockCmd.push = f => f()

export default () => {
  window.googletag = window.googletag || {
    cmd: mockCmd,
    pubads: jest.fn(() => ({
      addEventListener: (eventName, callback) => {
        if (!eventListenerStore[eventName]) {
          eventListenerStore[eventName] = []
        }
        eventListenerStore[eventName].push(callback)
      },
      getSlots: mockGetSlots,
      enableSingleRequest: mockEnableSingleRequest,
      refresh: mockPubadsRefresh,
      setTargeting: mockSetTargeting,
    })),
    defineSlot: jest.fn(() => ({
      addService: jest.fn(),
    })),
    display: jest.fn(),
    enableServices: jest.fn(),
  }
  return window.googletag
}
