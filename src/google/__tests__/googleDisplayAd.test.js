/* eslint-env jest */

import getGoogleTag, {
  __runCommandQueue, // eslint-disable-line import/named
  __reset, // eslint-disable-line import/named
} from 'src/google/getGoogleTag'
import googleDisplayAd from 'src/google/googleDisplayAd'

jest.mock('src/google/getGoogleTag')

beforeEach(() => {
  // Set up googletag
  const googletag = getGoogleTag()
  googletag.cmd = []
})

afterEach(() => {
  __reset()
})

describe('googleDisplayAd', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    googleDisplayAd('my-ad')
  })

  it('pushes commands to googletag.cmd', () => {
    const googletag = getGoogleTag()
    googleDisplayAd('some-ad')
    expect(googletag.cmd.length).toBe(1)
    googleDisplayAd('another-ad')
    expect(googletag.cmd.length).toBe(2)
  })

  it('calls the expected ad ID when the googletag commands run', () => {
    const googletag = getGoogleTag()
    googleDisplayAd('this-is-my-ad')
    __runCommandQueue()
    expect(googletag.display).toHaveBeenCalledWith('this-is-my-ad')
  })
})
