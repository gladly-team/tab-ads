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
  onError: expect.any(Function),
}

const getMinimalValidUserConfig = () => ({
  consent: {
    isEU: () => Promise.resolve(false),
  },
  publisher: {
    domain: 'example.com',
    pageUrl: 'https://example.com/foo',
  },
})

describe('config: setConfig', () => {
  it('returns an object', () => {
    const { setConfig } = require('src/config')
    expect(setConfig(getMinimalValidUserConfig())).toEqual(expect.any(Object))
  })

  it('returns an object with the expected default structure', () => {
    const { setConfig } = require('src/config')
    const config = setConfig({
      ...getMinimalValidUserConfig(),
    })
    expect(config).toEqual(defaultConfigStructure)
  })

  it('allows customizing most of its properties', () => {
    const { setConfig } = require('src/config')
    const isEUFunc = () => new Promise(true)
    const modifiedConfig = {
      ...getMinimalValidUserConfig(),
      disableAds: true,
      // useMockAds should use the default
      auctionTimeout: 200,
      bidderTimeout: 12,
      consent: {
        ...getMinimalValidUserConfig().consent,
        isEU: isEUFunc,
        // timeout should use the default
      },
      publisher: {
        ...getMinimalValidUserConfig().publisher,
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
        isEU: isEUFunc,
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
})

describe('config: setConfig validation', () => {
  it('throws if the publisher domain is not provided', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        publisher: {
          domain: undefined,
          pageUrl: 'https://example.com/something/',
        },
      })
    }).toThrow('Config error: the publisher.domain property must be set.')
  })

  it('throws if the publisher domain is not a string', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        publisher: {
          domain: 123,
          pageUrl: 'https://example.com/something/',
        },
      })
    }).toThrow('Config error: the publisher.domain property must be a string.')
  })

  it('throws if the publisher page URL is not provided', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        publisher: {
          domain: 'example.com',
          pageUrl: undefined,
        },
      })
    }).toThrow('Config error: the publisher.pageUrl property must be set.')
  })

  it('throws if the publisher page URL is not a string', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        publisher: {
          domain: 'example.com',
          pageUrl: () => {},
        },
      })
    }).toThrow('Config error: the publisher.pageUrl property must be a string.')
  })

  it('throws if the consent.isEU property is not provided', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        consent: {
          ...getMinimalValidUserConfig(),
          isEU: undefined,
        },
      })
    }).toThrow('Config error: the consent.isEU function must be set.')
  })

  it('throws if the consent.isEU property is not a function', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        consent: {
          ...getMinimalValidUserConfig(),
          isEU: false,
        },
      })
    }).toThrow(
      'Config error: the consent.isEU property must be an async function.'
    )
  })
})

describe('config: getConfig', () => {
  it('throws if setConfig has not yet been called', () => {
    const { getConfig } = require('src/config')
    expect(() => {
      getConfig()
    }).toThrow('You must call `setConfig` before using the config.')
  })

  it('returns the stored config', () => {
    const { setConfig, getConfig } = require('src/config')
    const modifiedConfig = {
      ...getMinimalValidUserConfig(),
      publisher: {
        ...getMinimalValidUserConfig().publisher,
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
