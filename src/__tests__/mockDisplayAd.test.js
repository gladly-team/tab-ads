/* eslint-env jest */

import mockDisplayAd from 'src/mockDisplayAd'

jest.useFakeTimers()

describe('mockDisplayAd', function() {
  it('runs without error', () => {
    mockDisplayAd()
    jest.runAllTimers()
  })
})
