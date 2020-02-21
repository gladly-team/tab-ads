/* eslint-env jest */

import { getMockBidResponse } from 'src/utils/test-utils'

export default adId => {
  return {
    adId,
    ...getMockBidResponse(),
  }
}
