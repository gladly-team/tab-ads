/* eslint-env jest */
import Bidder from 'src/utils/Bidder'

const MockPrebidBidder = Bidder({
  name: 'prebid',
  fetchBids: jest.fn(() => Promise.resolve()),
  setTargeting: jest.fn(),
})

export default MockPrebidBidder
