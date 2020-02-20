/* eslint-env jest */

afterEach(() => {
  jest.resetModules()
})

const defaultConfigStructure = {
  disableAds: expect.any(Boolean),
  useMockAds: expect.any(Boolean),
  adUnits: [
    {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
    {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
    {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
  ],
  auctionTimeout: expect.any(Number),
  bidderTimeout: expect.any(Number),
  consent: {
    isEU: expect.any(Function),
    timeout: expect.any(Number),
  },
  publisher: {
    domain: expect.any(String),
    pageUrl: expect.any(String),
  },
  newTabAds: {
    leaderboard: {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
    rectangleAdPrimary: {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
    rectangleAdSecondary: {
      adId: expect.any(String),
      adUnitId: expect.any(String),
      sizes: expect.any(Array),
    },
  },
  logLevel: expect.any(String),
}

describe('config: setConfig', () => {
  it('returns an object', () => {
    const { setConfig } = require('src/config')
    expect(
      setConfig({
        publisher: {
          domain: 'example.com',
          pageUrl: 'https://example.com/foo',
        },
      })
    ).toEqual(expect.any(Object))
  })

  it('returns an object with the expected default structure', () => {
    const { setConfig } = require('src/config')
    const config = setConfig({
      publisher: {
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
    })
    expect(config).toEqual(defaultConfigStructure)
  })

  it('allows customizing most of its properties', () => {
    const { setConfig } = require('src/config')
    const isEUFunc = () => new Promise(true)
    const modifiedConfig = {
      disableAds: true,
      // useMockAds should use the default
      auctionTimeout: 200,
      bidderTimeout: 12,
      consent: {
        isEu: isEUFunc,
        // timeout should use the default
      },
      publisher: {
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
    }
    const config = setConfig(modifiedConfig)
    expect(config).toMatchObject({
      disableAds: true,
      useMockAds: false, // default value
      auctionTimeout: 200,
      bidderTimeout: 12,
      consent: {
        isEu: isEUFunc,
        timeout: 50, // default value
      },
      publisher: {
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
      newTabAds: expect.any(Object), // default value
      adUnits: expect.any(Array), // default value
    })
  })

  it('throws if the publisher domain is not provided', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({})
    }).toThrow('Config error: the publisher.domain property must be set.')
  })
})

describe('config: getConfig', () => {
  it('returns the default when setConfig has not yet been called', () => {
    const { getConfig } = require('src/config')
    expect(getConfig()).toEqual(defaultConfigStructure)
  })

  it('returns the stored config', () => {
    const { setConfig, getConfig } = require('src/config')
    const modifiedConfig = {
      publisher: {
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
      disableAds: true,
      auctionTimeout: 1234,
    }
    const config = setConfig(modifiedConfig)
    expect(getConfig()).toEqual(config)
  })
})
