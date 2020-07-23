/* eslint-env jest */

import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

const mockCmd = []
mockCmd.push = (f) => f()

export default jest.fn(() => {
  global.headertag = global.headertag || {
    cmd: mockCmd,
    retrieveDemand: jest.fn((config, callback) => callback()),
  }
  return global.headertag
})
