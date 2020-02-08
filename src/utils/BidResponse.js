// Create a BidResponse object. This is a standardized set of info
// about a bid for a particular ad slot.
const BidResponse = ({
  revenue,
  encodedRevenue,
  DFPAdvertiserId,
  advertiserName,
  adSize,
}) => {
  if (!(revenue || encodedRevenue)) {
    throw new Error(
      'A bid response must have either the "revenue" or "encodedRevenue" property.'
    )
  }
  if (typeof revenue !== 'number') {
    throw new Error('The "revenue" value must be a number.')
  }

  // TODO: additional input validation

  return {
    revenue, // Float
    encodedRevenue, // String|null
    DFPAdvertiserId, // Number
    advertiserName, // String
    adSize, // String, such as "728x90"
  }
}

export default BidResponse
