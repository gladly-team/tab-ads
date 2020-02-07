/* eslint-env jest */

import getAds from 'src/fetchAds'

jest.mock('src/fetchAds')
jest.mock('src/utils/logger')

describe('index.js', () => {
  it('contains the expected exports', () => {
    const index = require('src/index')
    expect(index.fetchAds).toBeDefined()
    expect(index.fetchAds).toEqual(expect.any(Function))
  })

  it('fetches ads with no config', async () => {
    expect.assertions(2)
    const { fetchAds } = require('src/index')
    await fetchAds()
    expect(getAds).toHaveBeenCalledTimes(1)
    expect(getAds).toHaveBeenCalledWith(undefined)
  })

  it('fetches ads with the config, when provided', async () => {
    expect.assertions(1)
    const { fetchAds } = require('src/index')
    const myConfig = { foo: 'bar' }
    await fetchAds(myConfig)
    expect(getAds).toHaveBeenCalledWith(myConfig)
  })
})
