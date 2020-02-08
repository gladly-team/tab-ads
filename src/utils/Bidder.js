// Create a bidder object. A bidder is an ad provider that
// fetches bids to fill ad slots.
const Bidder = ({ name, fetchBids, setTargeting }) => {
  if (!name) {
    throw new Error('The bidder must have a "name" property.')
  }
  if (typeof name !== 'string') {
    throw new Error('The "name" property must be a string.')
  }
  if (!fetchBids) {
    throw new Error('The bidder must have a "fetchBids" property.')
  }
  if (typeof fetchBids !== 'function') {
    throw new Error('The "fetchBids" property must be a function.')
  }
  if (!setTargeting) {
    throw new Error('The bidder must have a "setTargeting" property.')
  }
  if (typeof setTargeting !== 'function') {
    throw new Error('The "setTargeting" property must be a function.')
  }
  return {
    // A string unique to the bidder. The bidder should have a file name
    // with structure `${name}Bidder`.
    name,
    /**
     * Fetch bids for this bidder. Async function that takes our tab-ads
     * config and returns a Promise that resolves to bid data.
     * @param config - the tab-ads config object
     * @return {Promise<Object>} BidResponseData
     * @return {Object} BidResponseData.bidResponses - An object with
     *   keys equal to each adId for which there's a bid and values with
     *   a BidResponse, the bidder's normalized bid for that ad.
     * @return {Object} BidResponseData.rawBidResponses - An object with
     *   keys equal to each adId for which there's a bid and values with
     *   the raw bid response structure (different for each bidder).
     */
    fetchBids,
    /**
     * A function that sets the bidder's key/value targeting on the request
     * to our ad server, specifying this bidder's bids. We should call this
     * before making the ad server request.
     * @return {undefined}
     */
    setTargeting,
  }
}

export default Bidder
