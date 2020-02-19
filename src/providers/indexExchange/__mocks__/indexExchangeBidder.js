/* eslint-env jest */
import Bidder from 'src/utils/Bidder'

const MockIndexExchangeBidder = Bidder({
  name: 'indexExchange',
  fetchBids: jest.fn(() => Promise.resolve()),
  setTargeting: jest.fn(),
})

export default MockIndexExchangeBidder
