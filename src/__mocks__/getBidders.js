// TODO: write mocks.

import { isClientSide } from 'src/utils/ssr'

let bidders = []

// Bidder code (like Prebid) can rely on the window variable,
// so we can't load bidders when rendering server-side.
if (isClientSide()) {
  const prebidBidder = require('src/providers/prebid/prebidBidder').default
  const amazonBidder = require('src/providers/amazon/amazonBidder').default
  bidders = [prebidBidder, amazonBidder]
}

/**
 * On the client side, return an array of active bidders.
 * In a server environment, return an empty array.
 * @return {Bidder[]}
 */
const getBidders = () => bidders

export default getBidders
