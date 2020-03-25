/* eslint-env jest */

import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'
import indexExchangeBidder from 'src/providers/indexExchange/indexExchangeBidder'
import getBidders from 'src/getBidders'
import { isClientSide } from 'src/utils/ssr'

jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/providers/prebid/prebidBidder')
jest.mock('src/providers/amazon/amazonBidder')
jest.mock('src/utils/ssr')

beforeEach(() => {
  isClientSide.mockReturnValue(true)
})

describe('bidders', () => {
  it('returns the expected enabled bidders on the client side', () => {
    expect(getBidders()).toEqual([
      prebidBidder,
      amazonBidder,
      indexExchangeBidder,
    ])
  })

  it('returns an empty array when not on the client side', () => {
    isClientSide.mockReturnValue(false)
    expect(getBidders()).toEqual([])
  })
})
