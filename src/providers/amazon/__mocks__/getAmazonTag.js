/* eslint-env jest */
import getGlobal from 'src/utils/getGlobal'

export default () => {
  const global = getGlobal()
  global.apstag = global.apstag || {
    init: jest.fn(),
    fetchBids: jest.fn((config, bidsBackCallback) => {
      // By default, immediately resolve the fetched bids.
      bidsBackCallback([])
    }),
    renderImp: jest.fn(),
    setDisplayBids: jest.fn(),
  }
  return global.apstag
}
