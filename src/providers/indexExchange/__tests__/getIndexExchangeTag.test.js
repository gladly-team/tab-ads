/* eslint-env jest */

import getIndexExchangeTag from 'src/providers/indexExchange/getIndexExchangeTag'
import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

afterEach(() => {
  delete global.headertag
})

describe('getIndexExchangeTag', () => {
  it('returns the global.headertag object if one exists', () => {
    const fakeExistingTag = {
      something: {},
    }
    global.headertag = fakeExistingTag
    const ixTag = getIndexExchangeTag()
    expect(ixTag).toBe(fakeExistingTag)
  })

  it('returns a placeholder object with cmd if global.headertag is not set', () => {
    const ixTag = getIndexExchangeTag()
    expect(ixTag).toEqual({
      cmd: [],
    })
  })

  it("sets global.headertag if it isn't already set", () => {
    expect(global.headertag).toBeUndefined()
    getIndexExchangeTag()
    expect(global.headertag).not.toBeUndefined()
    expect(global.headertag.cmd).toEqual([])
  })
})
