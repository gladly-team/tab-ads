import { isClientSide } from 'src/utils/ssr'

/**
 * On the client side, return an array of active bidders.
 * In a server environment, return an empty array.
 * @return {Bidder[]}
 */
const getBidders = () => {
  // Bidder cdoe (like Prebid) can rely on the window variable,
  // so we can't include when rendering server-side.
  if (isClientSide()) {
    const prebidBidder = require('src/providers/prebid/prebidBidder').default
    const amazonBidder = require('src/providers/amazon/amazonBidder').default
    const indexExchangeBidder = require('src/providers/indexExchange/indexExchangeBidder')
      .default
    return [prebidBidder, amazonBidder, indexExchangeBidder]
  }
  return []
}

export default getBidders
