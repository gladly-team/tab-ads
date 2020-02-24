import prebidBidder from 'src/providers/prebid/prebidBidder'
import amazonBidder from 'src/providers/amazon/amazonBidder'
import indexExchangeBidder from 'src/providers/indexExchange/indexExchangeBidder'

// Return an array of active bidders.
export default [prebidBidder, amazonBidder, indexExchangeBidder]
