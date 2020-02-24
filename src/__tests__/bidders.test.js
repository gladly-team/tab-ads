/* eslint-env jest */

import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'
import indexExchangeBidder from 'src/providers/indexExchange/indexExchangeBidder'
import bidders from 'src/bidders'

jest.mock('src/providers/amazon/getAmazonTag')
jest.mock('src/providers/prebid/prebidBidder')
jest.mock('src/providers/amazon/amazonBidder')

describe('bidders', () => {
  it('returns the expected enabled bidders', () => {
    expect(bidders).toEqual([prebidBidder, amazonBidder, indexExchangeBidder])
  })
})
