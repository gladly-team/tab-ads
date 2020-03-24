/* eslint-env jest */

import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

afterEach(() => {
  delete global.apstag
})

describe('getAmazonTag', () => {
  it('uses existing global.apstag object if one exists', () => {
    // Set a fake existing googletag
    const fakeExistingAmazonTag = {
      something: {},
    }
    global.apstag = fakeExistingAmazonTag

    const amazonTag = getAmazonTag()
    expect(amazonTag).toBe(fakeExistingAmazonTag)
  })

  it('returns undefined if global.apstag is not set', () => {
    const amazonTag = getAmazonTag()
    expect(amazonTag).toBeUndefined()
  })
})
