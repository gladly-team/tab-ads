/* eslint-env jest */

import { getMockDisplayedAdInfo } from 'src/utils/test-utils'

export const getWinningBidForAd = jest.fn((adId) => ({
  adId,
  ...getMockDisplayedAdInfo(),
}))

export const getAllWinningBids = jest.fn(() => ({}))
