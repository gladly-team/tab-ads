/* eslint-env jest */
import Bidder from 'src/utils/Bidder'

const MockAmazonBidder = Bidder({
  name: 'amazon',
  fetchBids: jest.fn(() => Promise.resolve()),
  setTargeting: jest.fn(),
})

export default MockAmazonBidder
