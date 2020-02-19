/* eslint-env jest */

// By default, just execute commands in the queue.
const mockQue = []
mockQue.push = f => f()

export default () => {
  window.pbjs = window.pbjs || {
    que: mockQue,
    setConfig: jest.fn(),
    bidderSettings: {},
    addAdUnits: jest.fn(),
    requestBids: jest.fn(requestBidsSettings => {
      requestBidsSettings.bidsBackHandler({})
    }),
    setTargetingForGPTAsync: jest.fn(),
  }
  return window.pbjs
}
