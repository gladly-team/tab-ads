/* eslint-env jest */

import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

// By default, just execute commands in the queue.
const mockQue = []
mockQue.push = (f) => f()

export default () => {
  global.pbjs = global.pbjs || {
    que: mockQue,
    setConfig: jest.fn(),
    bidderSettings: {},
    addAdUnits: jest.fn(),
    requestBids: jest.fn((requestBidsSettings) => {
      requestBidsSettings.bidsBackHandler({})
    }),
    setTargetingForGPTAsync: jest.fn(),
  }
  return global.pbjs
}
