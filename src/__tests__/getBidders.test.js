/* eslint-env jest */

jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/providers/prebid/prebidBidder')
jest.mock('src/providers/amazon/amazonBidder')
jest.mock('src/utils/ssr')

beforeEach(() => {
  // Default to rendering on the client side.
  const { isClientSide } = require('src/utils/ssr')
  isClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.resetModules()
})

describe('bidders', () => {
  it('returns the expected enabled bidders on the client side', () => {
    const { isClientSide } = require('src/utils/ssr')
    isClientSide.mockReturnValue(true)
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const indexExchangeBidder =
      require('src/providers/indexExchange/indexExchangeBidder').default
    const getBidders = require('src/getBidders').default
    expect(getBidders()).toEqual([
      prebidBidder,
      amazonBidder,
      indexExchangeBidder,
    ])
  })

  it('returns an empty array when not on the client side', () => {
    const { isClientSide } = require('src/utils/ssr')
    isClientSide.mockReturnValue(false)
    const getBidders = require('src/getBidders').default
    expect(getBidders()).toEqual([])
  })
})
