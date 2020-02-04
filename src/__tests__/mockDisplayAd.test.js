/* eslint-env jest */

import mockDisplayAd from 'src/mockDisplayAd'

jest.useFakeTimers()

describe('mockDisplayAd', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    mockDisplayAd()
    jest.runAllTimers()
  })
})
