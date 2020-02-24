import { isNil } from 'lodash/lang'

// Create a BidResponse object. This is a standardized set of info
// about a bid for a particular ad slot.
const BidResponse = ({
  adId,
  revenue = null,
  encodedRevenue = null,
  // GAMAdvertiserId will only be set for a winning ad that's already
  // been displayed. We won't know it beforehand.
  GAMAdvertiserId = null,
  advertiserName,
  adSize,
}) => {
  if (isNil(adId)) {
    throw new Error('The "adId" value must be provided.')
  }
  if (typeof adId !== 'string') {
    throw new Error('The "adId" value must be a string.')
  }
  if (isNil(revenue) && isNil(encodedRevenue)) {
    throw new Error(
      'A bid response must have either the "revenue" or "encodedRevenue" property.'
    )
  }
  if (!isNil(revenue) && typeof revenue !== 'number') {
    throw new Error('The "revenue" value must be a number.')
  }
  if (!isNil(GAMAdvertiserId) && typeof GAMAdvertiserId !== 'number') {
    throw new Error('The "GAMAdvertiserId" value must be a number.')
  }
  if (isNil(advertiserName)) {
    throw new Error('The "advertiserName" value must be provided.')
  }
  if (typeof advertiserName !== 'string') {
    throw new Error('The "advertiserName" value must be a string.')
  }
  if (isNil(adSize)) {
    throw new Error('The "adSize" value must be provided.')
  }
  if (typeof adSize !== 'string') {
    throw new Error('The "adSize" value must be a string.')
  }

  return {
    adId,
    revenue, // Float|null
    encodedRevenue, // String|null
    GAMAdvertiserId, // Number|null
    advertiserName, // String
    adSize, // String, such as "728x90"
  }
}

export default BidResponse
