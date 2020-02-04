/* eslint-env jest */

const mockGoogleDisplayAd = jest.fn()
const mockMockDisplayAd = jest.fn()
jest.mock('src/google/googleDisplayAd', () => mockGoogleDisplayAd)
jest.mock('src/mockDisplayAd', () => mockMockDisplayAd)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

describe('displayAd', () => {
  it('calls mockDisplayAd when ads are not enabled', () => {
    jest.mock('src/adsEnabledStatus', () => () => false)
    const displayAd = require('src/displayAd').default
    displayAd('my-ad')
    expect(mockGoogleDisplayAd).not.toHaveBeenCalled()
    expect(mockMockDisplayAd).toHaveBeenCalledWith('my-ad')
  })

  it('calls googleDisplayAd when ads are enabled', () => {
    jest.mock('src/adsEnabledStatus', () => () => true)
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    expect(mockGoogleDisplayAd).toHaveBeenCalledWith('some-ad')
    expect(mockMockDisplayAd).not.toHaveBeenCalled()
  })
})
