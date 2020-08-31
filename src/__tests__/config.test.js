/* eslint-env jest */

import queue from 'src/utils/queue'

jest.mock('src/utils/getURL')
jest.mock('src/utils/queue')

beforeEach(() => {
  const getURL = require('src/utils/getURL').default
  getURL.mockReturnValue('https://example.com/foo/bar/')
})

afterEach(() => {
  jest.resetModules()
})

const defaultConfigStructure = {
  disableAds: expect.any(Boolean),
  useMockAds: expect.any(Boolean),
  adUnits: [],
  auctionTimeout: expect.any(Number),
  bidderTimeout: expect.any(Number),
  consent: {
    enabled: expect.any(Boolean),
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
  publisher: {
    domain: 'example.com',
    pageUrl: 'https://example.com/foo',
  },
  onError: () => {},
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
    const modifiedConfig = {
      ...getMinimalValidUserConfig(),
      disableAds: true,
      // useMockAds should use the default
      auctionTimeout: 200,
      bidderTimeout: 12,
      consent: {
        ...getMinimalValidUserConfig().consent,
        timeout: 123,
      },
      publisher: {
        ...getMinimalValidUserConfig().publisher,
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
      logLevel: 'warn',
    }
    const config = setConfig(modifiedConfig)
    expect(config).toMatchObject({
      disableAds: true,
      useMockAds: false, // default value
      auctionTimeout: 200,
      bidderTimeout: 12,
      consent: {
        timeout: 123,
      },
      publisher: {
        domain: 'example.com',
        pageUrl: 'https://example.com/foo',
      },
      newTabAds: expect.any(Object), // default value
      adUnits: expect.any(Array), // default value
      logLevel: 'warn',
    })
  })

  it('defaults to an empty array of adUnits', () => {
    const { setConfig } = require('src/config')
    const config = setConfig(getMinimalValidUserConfig())
    expect(config).toMatchObject({
      adUnits: [],
    })
  })

  it('allows customizing the adUnits property', () => {
    const { setConfig } = require('src/config')
    const modifiedConfig = {
      ...getMinimalValidUserConfig(),
      adUnits: [
        {
          adId: 'div-gpt-ad-2233445566-0',
          adUnitId: '/11228899/HBTR',
          sizes: [[300, 250]],
        },
      ],
    }
    const config = setConfig(modifiedConfig)
    expect(config).toMatchObject({
      adUnits: [
        {
          adId: 'div-gpt-ad-2233445566-0',
          adUnitId: '/11228899/HBTR',
          sizes: [[300, 250]],
        },
      ],
    })
  })

  it('calls queue.runQueue(true)', () => {
    const { setConfig } = require('src/config')
    setConfig(getMinimalValidUserConfig())
    expect(queue.runQueue).toHaveBeenCalledWith(true)
  })

  it('defaults to logLevel === error', () => {
    const { setConfig } = require('src/config')
    const config = setConfig(getMinimalValidUserConfig())
    expect(config).toMatchObject({
      logLevel: 'error',
    })
  })

  it('sets logLevel to "debug" if the URL includes the URL param tabAdsDebug=true', () => {
    const getURL = require('src/utils/getURL').default
    getURL.mockReturnValue(
      'https://example.com/foo/bar/?abc=123&tabAdsDebug=true&foo'
    )
    const { setConfig } = require('src/config')
    const config = setConfig({
      ...getMinimalValidUserConfig(),
      logLevel: 'error',
    })
    expect(config).toMatchObject({
      logLevel: 'debug',
    })
  })
})

describe('config: setConfig validation', () => {
  it('throws if the onError handler is not provided', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        onError: null,
      })
    }).toThrow('Config error: the onError property must be set.')
  })

  it('throws if the onError handler is not a function', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        onError: 'oops',
      })
    }).toThrow('Config error: the onError property must be a function.')
  })

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

  it('throws if an ad unit does not have an adId property', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: undefined, // missing
            adUnitId: '/13572468/SomeAdUnit',
            sizes: [[300, 250]],
          },
        ],
      })
    }).toThrow('Config error: adUnits objects must have an "adId" property.')
  })

  it("throws if an ad unit's adId property is not a string", () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 12345, // wrong
            adUnitId: '/13572468/SomeAdUnit',
            sizes: [[300, 250]],
          },
        ],
      })
    }).toThrow('Config error: adUnits\' "adId" property must be a string.')
  })

  it('throws if an ad unit does not have an adUnitId property', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 'div-gpt-ad-123456789-0',
            adUnitId: undefined, // missing
            sizes: [[300, 250]],
          },
        ],
      })
    }).toThrow(
      'Config error: adUnits objects must have an "adUnitId" property.'
    )
  })

  it("throws if an ad unit's adUnitId property is not a string", () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 'div-gpt-ad-123456789-0',
            adUnitId: false, // wrong
            sizes: [[300, 250]],
          },
        ],
      })
    }).toThrow('Config error: adUnits\' "adUnitId" property must be a string.')
  })

  it('throws if an ad unit does not have a sizes property', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 'div-gpt-ad-123456789-0',
            adUnitId: '/13572468/SomeAdUnit',
            sizes: undefined, // missing
          },
        ],
      })
    }).toThrow('Config error: adUnits objects must have an "sizes" property.')
  })

  it("throws if an ad unit's sizes property is not an array", () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 'div-gpt-ad-123456789-0',
            adUnitId: '/13572468/SomeAdUnit',
            sizes: '300x250', // wrong
          },
        ],
      })
    }).toThrow('Config error: adUnits\' "sizes" property must be an array.')
  })

  it("throws if an ad unit's sizes property is an empty array", () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        adUnits: [
          {
            adId: 'div-gpt-ad-123456789-0',
            adUnitId: '/13572468/SomeAdUnit',
            sizes: [], // wrong
          },
        ],
      })
    }).toThrow(
      'Config error: adUnits\' "sizes" property must have at least one size specified.'
    )
  })

  it('does not throw if the consent property is undefined', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        consent: undefined,
      })
    }).not.toThrow()
  })

  it('throws if the consent.enabled property is set but is not a Boolean', () => {
    const { setConfig } = require('src/config')
    expect(() => {
      setConfig({
        ...getMinimalValidUserConfig(),
        consent: {
          enabled: 'yes',
        },
      })
    }).toThrow('Config error: the consent.enabled property must be a boolean.')
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
