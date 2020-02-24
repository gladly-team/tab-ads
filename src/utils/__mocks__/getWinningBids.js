/* eslint-env jest */

import { getMockBidResponse } from 'src/utils/test-utils'

export const getWinningBidForAd = jest.fn(adId => {
  return {
    adId,
    ...getMockBidResponse(),
  }
})

export const getAllWinningBids = jest.fn(() => ({}))
