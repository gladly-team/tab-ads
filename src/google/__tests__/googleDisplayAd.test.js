/* eslint-env jest */

import getGoogleTag, {
  __runCommandQueue, // eslint-disable-line import/named
} from 'src/google/getGoogleTag'
import googleDisplayAd from 'src/google/googleDisplayAd'
import getGlobal from 'src/utils/getGlobal'

jest.mock('src/google/getGoogleTag')

const global = getGlobal()

beforeEach(() => {
  delete global.googletag

  // Set up googletag
  global.googletag = getGoogleTag()
  global.googletag.cmd = []
})

afterAll(() => {
  delete global.googletag
})

describe('googleDisplayAd', () => {
  // eslint-disable-next-line jest/expect-expect
  it('runs without error', () => {
    googleDisplayAd('my-ad')
  })

  it('pushes commands to googletag.cmd', () => {
    googleDisplayAd('some-ad')
    expect(global.googletag.cmd.length).toBe(1)
    googleDisplayAd('another-ad')
    expect(global.googletag.cmd.length).toBe(2)
  })

  it('calls the expected ad ID when the googletag commands run', () => {
    googleDisplayAd('this-is-my-ad')
    __runCommandQueue()
    expect(global.googletag.display).toHaveBeenCalledWith('this-is-my-ad')
  })
})
