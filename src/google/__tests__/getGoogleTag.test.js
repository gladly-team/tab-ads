/* eslint-env jest */

import getGlobal from 'src/utils/getGlobal'
import getGoogleTag from 'src/google/getGoogleTag'

const global = getGlobal()

afterEach(() => {
  delete global.googletag
})

describe('getGoogleTag', () => {
  it('sets global.googletag', () => {
    delete global.googletag
    expect(global.googletag).toBeUndefined()
    getGoogleTag()
    expect(global.googletag).not.toBeUndefined()
    expect(global.googletag.cmd).toEqual([])
  })

  it('uses existing global.googletag object if one exists', () => {
    // Set a fake existing googletag
    const fakeCmd = () => {}
    const fakeExistingGoogletag = {
      cmd: [fakeCmd],
    }
    global.googletag = fakeExistingGoogletag

    const gTag = getGoogleTag()
    expect(gTag).toBe(fakeExistingGoogletag)
  })
})
