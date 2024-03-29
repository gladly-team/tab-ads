/* eslint-env jest */

let googletag

export const __reset = () => {
  googletag = undefined
}

// By default, we run functions in the queue immediately.
// Call this to disable that.
export const __disableAutomaticCommandQueueExecution = () => {
  googletag.cmd = []
}

// Run all functions in googletag.cmd.
export const __runCommandQueue = () => {
  googletag.cmd.forEach((cmd) => cmd())
}

let mockPubadsRefresh = jest.fn()
const mockEnableSingleRequest = jest.fn()

// Set a mock function for googletag.pubads().refresh.
export const __setPubadsRefreshMock = (mockFunction) => {
  mockPubadsRefresh = mockFunction
}

const MockSlot = ({ adUnitPath, slotElementId }) => ({
  getAdUnitPath: () => adUnitPath,
  getSlotElementId: () => slotElementId,
  setTargeting: jest.fn(),
})

const mockSlots = [
  // Mock ad unit IDs from the adSettings mock.
  // Bottom leaderboard
  MockSlot({
    adUnitPath: '/43865596/HBTL',
    slotElementId: 'div-gpt-ad-1464385677836-0',
  }),
  // First (bottom) rectangle ad
  MockSlot({
    adUnitPath: '/43865596/HBTR',
    slotElementId: 'div-gpt-ad-1464385742501-0',
  }),
  // Second (top) rectangle ad
  MockSlot({
    adUnitPath: '/43865596/HBTR2',
    slotElementId: 'div-gpt-ad-1539903223131-0',
  }),
]

const mockGetSlots = jest.fn(() => mockSlots)
const mockSetTargeting = jest.fn()

const eventListenerStore = {}

// Mock an event fired.
export const __runEventListenerCallbacks = (eventName, ...args) => {
  eventListenerStore[eventName].forEach((f) => f(...args))
}

const mockCmd = []
mockCmd.push = jest.fn((f) => f())

export default jest.fn(() => {
  googletag = googletag || {
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
  return googletag
})
