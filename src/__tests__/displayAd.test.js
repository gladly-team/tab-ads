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
  it('calls googleDisplayAd', () => {
    const displayAd = require('src/displayAd').default
    displayAd('some-ad')
    expect(mockGoogleDisplayAd).toHaveBeenCalledWith('some-ad')
    expect(mockMockDisplayAd).not.toHaveBeenCalled()
  })

  // TODO: more tests
})
