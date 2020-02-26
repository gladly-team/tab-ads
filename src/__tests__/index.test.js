/* eslint-env jest */

import getAds from 'src/fetchAds'
import AdComponent from 'src/AdComponent'
import { getAllWinningBids } from 'src/utils/getWinningBids'

jest.mock('src/AdComponent')
jest.mock('src/fetchAds')
jest.mock('src/utils/logger')

describe('index.js', () => {
  it('exports fetchAds', () => {
    const index = require('src/index')
    expect(index.fetchAds).toBeDefined()
    expect(index.fetchAds).toEqual(expect.any(Function))
  })

  it('does not export getAllWinningBids', () => {
    const index = require('src/index')
    expect(index.getAllWinningBids).toBeUndefined()
  })

  it('exports AdComponent', () => {
    const index = require('src/index')
    expect(index.AdComponent).toBeDefined()
    expect(index.AdComponent).toBe(AdComponent)
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

  it('assigns getAllWinningBids to the tabAds global', () => {
    expect(window.tabAds.getAllWinningBids).toBe(getAllWinningBids)
  })
})
