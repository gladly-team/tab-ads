/* eslint-env jest */

describe('ads enabled status', () => {
  it('enables ads', () => {
    const adsEnabledStatus = require('src/adsEnabledStatus').default
    expect(adsEnabledStatus()).toBe(true)
  })
})
