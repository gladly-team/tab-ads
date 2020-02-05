/* eslint-env jest */

import getGoogleTag, {
  __runCommandQueue, // eslint-disable-line import/named
} from 'src/google/getGoogleTag'
import googleDisplayAd from 'src/google/googleDisplayAd'

jest.mock('src/google/getGoogleTag')

beforeEach(() => {
  delete window.googletag

  // Set up googletag
  window.googletag = getGoogleTag()
  window.googletag.cmd = []
})

afterAll(() => {
  delete window.googletag
})

describe('googleDisplayAd', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    googleDisplayAd('my-ad')
  })

  it('pushes commands to googletag.cmd', () => {
    googleDisplayAd('some-ad')
    expect(window.googletag.cmd.length).toBe(1)
    googleDisplayAd('another-ad')
    expect(window.googletag.cmd.length).toBe(2)
  })

  it('calls the expected ad ID when the googletag commands run', () => {
    googleDisplayAd('this-is-my-ad')
    __runCommandQueue()
    expect(window.googletag.display).toHaveBeenCalledWith('this-is-my-ad')
  })
})
