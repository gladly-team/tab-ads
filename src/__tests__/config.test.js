/* eslint-env jest */

afterEach(() => {
  jest.resetModules()
})

describe('config', () => {
  test('setConfig returns an object', () => {
    const { setConfig } = require('src/config')
    expect(setConfig()).toEqual(expect.any(Object))
  })

  test('setConfig returns an object with the expected default structure', () => {
    const { setConfig } = require('src/config')
    const config = setConfig()
    expect(config).toEqual({
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
    })
  })

  test('setConfig allows customizing most of its properties', () => {
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

  test('getConfig returns the stored config', () => {
    const { setConfig, getConfig } = require('src/config')
    const modifiedConfig = {
      disableAds: true,
      auctionTimeout: 1234,
    }
    const config = setConfig(modifiedConfig)
    expect(getConfig()).toEqual(config)
  })
})
