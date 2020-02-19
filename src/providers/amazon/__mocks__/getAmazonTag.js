/* eslint-env jest */

export default () => {
  window.apstag = window.apstag || {
    init: jest.fn(),
    fetchBids: jest.fn((config, bidsBackCallback) => {
      // By default, immediately resolve the fetched bids.
      bidsBackCallback([])
    }),
    renderImp: jest.fn(),
    setDisplayBids: jest.fn(),
  }
  return window.apstag
}
