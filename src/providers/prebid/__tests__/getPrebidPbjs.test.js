/* eslint-env jest */

import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'

afterEach(() => {
  delete window.pbjs
})

describe('getPrebidPbjs', () => {
  it('sets window.pbjs', () => {
    delete window.pbjs
    expect(window.pbjs).toBeUndefined()
    getPrebidPbjs()
    expect(window.pbjs).not.toBeUndefined()
  })

  it('uses existing window.pbjs object if one exists', () => {
    // Set a fake existing pbjs
    const fakeCmd = () => {}
    const fakeExistingPbjs = {
      que: [fakeCmd],
      foo: 'bar',
    }
    window.pbjs = fakeExistingPbjs

    expect(window.pbjs).toBe(fakeExistingPbjs)
    const pbVar = getPrebidPbjs()
    expect(pbVar).toBe(fakeExistingPbjs)
  })
})
