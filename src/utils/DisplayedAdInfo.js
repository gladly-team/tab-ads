import { isNil } from 'lodash/lang'

// Create a DisplayedAdInfo object. This is a standardized set of info
// about an ad that's been shown.
const DisplayedAdInfo = ({
  adId,
  revenue = null,
  encodedRevenue = null,
  GAMAdvertiserId,
  GAMAdUnitId,
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
  if (isNil(GAMAdvertiserId)) {
    throw new Error('The "GAMAdvertiserId" value must be provided.')
  }
  if (!isNil(GAMAdvertiserId) && typeof GAMAdvertiserId !== 'number') {
    throw new Error('The "GAMAdvertiserId" value must be a number.')
  }
  if (isNil(GAMAdUnitId)) {
    throw new Error('The "GAMAdUnitId" value must be provided.')
  }
  if (typeof GAMAdUnitId !== 'string') {
    throw new Error('The "GAMAdUnitId" value must be a string.')
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
    GAMAdUnitId, // String, such as "/12345678/SlotName"
    adSize, // String, such as "728x90"
  }
}

export default DisplayedAdInfo
