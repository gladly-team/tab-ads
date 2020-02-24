/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  clearAdDataStore()
})

describe('getWinningBidForAd', () => {
  it('placeholder', () => {
    const store = getAdDataStore()
    expect(store).toEqual(expect.any(Object))
  })
})
