/* eslint-env jest */

jest.mock('src/AdComponent')
jest.mock('src/fetchAds')
jest.mock('src/utils/getWinningBids')
jest.mock('src/getAvailableAdUnits')
jest.mock('src/utils/logger')
jest.mock('src/utils/ssr')

beforeEach(() => {
  const { isClientSide } = require('src/utils/ssr')
  isClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.resetModules()
})

describe('index.js: fetchAds', () => {
  it('exports fetchAds', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.fetchAds).toBeDefined()
    expect(index.fetchAds).toEqual(expect.any(Function))
  })

  it('fetches ads with no config', async () => {
    expect.assertions(2)
    const getAds = require('src/fetchAds').default
    const { fetchAds } = require('src/index')
    await fetchAds()
    expect(getAds).toHaveBeenCalledTimes(1)
    expect(getAds).toHaveBeenCalledWith(undefined)
  })

  it('fetches ads with the config, when provided', async () => {
    expect.assertions(1)
    const getAds = require('src/fetchAds').default
    const { fetchAds } = require('src/index')
    const myConfig = { foo: 'bar' }
    await fetchAds(myConfig)
    expect(getAds).toHaveBeenCalledWith(myConfig)
  })

  it('throws if fetchAds is called in a server environment', async () => {
    expect.assertions(1)
    const { isClientSide } = require('src/utils/ssr')
    isClientSide.mockReturnValue(false)
    const { fetchAds } = require('src/index')
    await expect(fetchAds()).rejects.toThrow(
      'The tab-ads package can only fetch ads in the browser environment.'
    )
  })
})

describe('index.js: AdComponent', () => {
  it('exports AdComponent', () => {
    expect.assertions(2)
    const AdComponent = require('src/AdComponent').default
    const index = require('src/index')
    expect(index.AdComponent).toBeDefined()
    expect(index.AdComponent).toBe(AdComponent)
  })
})

describe('index.js: getAvailableAdUnits', () => {
  it('exports getAvailableAdUnits', () => {
    expect.assertions(1)
    const index = require('src/index')
    expect(index.getAvailableAdUnits).toBeDefined()
  })

  it('returns the expected getAvailableAdUnits value', () => {
    expect.assertions(1)
    const getNewTabAdUnits = require('src/getAvailableAdUnits').default
    getNewTabAdUnits.mockReturnValue({
      leaderboard: {
        foo: 'bar',
      },
      something: {
        anotherThing: true,
      },
    })
    const index = require('src/index')
    expect(index.getAvailableAdUnits()).toEqual({
      leaderboard: {
        foo: 'bar',
      },
      something: {
        anotherThing: true,
      },
    })
  })
})

describe('index.js: global.tabAds.getAllWinningBids', () => {
  it('does not export getAllWinningBids', () => {
    expect.assertions(1)
    const index = require('src/index')
    expect(index.getAllWinningBids).toBeUndefined()
  })

  it('assigns getAllWinningBids to the tabAds global', () => {
    expect.assertions(1)
    const getGlobal = require('src/utils/getGlobal').default
    const global = getGlobal()
    expect(global.tabAds.getAllWinningBids).toBeDefined()
  })

  it('returns expected values from getAllWinningBids', () => {
    expect.assertions(1)
    const { getAllWinningBids } = require('src/utils/getWinningBids')
    getAllWinningBids.mockReturnValue({ some: 'data' })
    const getGlobal = require('src/utils/getGlobal').default
    const global = getGlobal()
    expect(global.tabAds.getAllWinningBids()).toEqual({ some: 'data' })
  })
})
