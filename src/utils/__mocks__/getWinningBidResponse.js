/* eslint-env jest */

import { getMockBidResponse } from 'src/utils/test-utils'

export default jest.fn(adId => {
  return {
    adId,
    ...getMockBidResponse(),
  }
})
