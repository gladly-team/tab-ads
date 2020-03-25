/* eslint-env jest */

import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

afterEach(() => {
  delete global.pbjs
})

describe('getPrebidPbjs', () => {
  it('sets global.pbjs', () => {
    delete global.pbjs
    expect(global.pbjs).toBeUndefined()
    getPrebidPbjs()
    expect(global.pbjs).not.toBeUndefined()
  })

  it('uses existing global.pbjs object if one exists', () => {
    // Set a fake existing pbjs
    const fakeCmd = () => {}
    const fakeExistingPbjs = {
      que: [fakeCmd],
      foo: 'bar',
    }
    global.pbjs = fakeExistingPbjs

    expect(global.pbjs).toBe(fakeExistingPbjs)
    const pbVar = getPrebidPbjs()
    expect(pbVar).toBe(fakeExistingPbjs)
  })
})
