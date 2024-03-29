/* eslint-env jest */
/* eslint-disable import/no-dynamic-require */

// We patch Prebid and Prebid adapters to make sure bid adapters
// pass the correct website domain when they load in the iframe
// within the browser new tab page. We use patch-package to
// modify the Node Prebid module code after it's installed.
// This file makes sure the patched Prebid code behaves as
// expected.

// We must also transform Prebid files (node_modules/prebid.js/)
// before testing. We include Prebid files in Jest transformation
// by setting transformIgnorePatterns as described here:
// https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization
// Note that the Babel config must be named babel.config.js:
// https://github.com/facebook/jest/issues/6229#issuecomment-392205646

import { JSDOM } from 'jsdom'

const prebidSrcPath = '../node_modules/prebid.js/src'

const getMockPrebidConfig = () => ({
  debug: false,
  bidderTimeout: 850,
  publisherDomain: 'https://example.com',
  pageUrl: 'https://example.com/my-page/',
  priceGranularity: 'medium',
  customPriceBucket: {},
  mediaTypePriceGranularity: {},
  enableSendAllBids: true,
  useBidCache: false,
  bidderSequence: 'random',
  timeoutBuffer: 400,
  disableAjaxTimeout: false,
})

// Mock Prebid's config.getConfig method.
jest.mock('../node_modules/prebid.js/src/config', () => {
  const prebidConfigActual = jest.requireActual(
    '../node_modules/prebid.js/src/config'
  )
  return {
    ...prebidConfigActual,
    config: {
      ...prebidConfigActual.config,
      getConfig: jest.fn(() => ({
        mock: 'config',
      })),
    },
  }
})

const getMockWindow = () => {
  // Create the window object we'd expect in our iframed new tab page.
  // https://github.com/facebook/jest/issues/5124#issuecomment-415494099

  // Create the parent window.
  const parentWindow = Object.create(new JSDOM())
  parentWindow.location = {
    ...parentWindow.location,
    ancestorOrigins: [],
    host: 'abcdefghijklmnopqrs',
    hostname: 'abcdefghijklmnopqrs',
    href: 'chrome-extension://abcdefghijklmnopqrs/iframe.html',
    origin: 'chrome-extension://abcdefghijklmnopqrs',
    pathname: '/iframe.html',
    port: '',
    protocol: 'chrome-extension',
    search: '',
  }
  parentWindow.document = { ...parentWindow.document, referrer: '' }
  parentWindow.parent = parentWindow
  parentWindow.top = parentWindow

  // Create the current window.
  const currentWindow = Object.create(new JSDOM())
  currentWindow.location = {
    ...currentWindow.location,
    ancestorOrigins: ['chrome-extension://abcdefghijklmnopqrs'],
    host: 'tab.gladly.io',
    hostname: 'tab.gladly.io',
    href: 'https://tab.gladly.io/newtab/',
    origin: 'https://tab.gladly.io',
    pathname: '/newtab/',
    port: '',
    protocol: 'https:',
    search: '',
  }
  currentWindow.document = { ...currentWindow.document, referrer: '' }

  // Give the current window a parent. Make accesing location
  // properties fail as we'd expect in a cross-origin environment.
  const parentWindowCrossDomain = {
    ...parentWindow,
    get location() {
      function crossOriginError() {
        throw new Error('Blocked a frame from accessing a cross-origin frame.')
      }
      return {
        get ancestorOrigins() {
          return crossOriginError()
        },
        get host() {
          return crossOriginError()
        },
        get hostname() {
          return crossOriginError()
        },
        get href() {
          return crossOriginError()
        },
        get origin() {
          return crossOriginError()
        },
        get pathname() {
          return crossOriginError()
        },
        get port() {
          return crossOriginError()
        },
        get protocol() {
          return crossOriginError()
        },
        get search() {
          return crossOriginError()
        },
      }
    },
  }
  currentWindow.parent = parentWindowCrossDomain
  currentWindow.top = parentWindowCrossDomain
  return currentWindow
}

let windowSpy

beforeEach(() => {
  // Reset the mock Prebid config value.
  const { config } = require('../node_modules/prebid.js/src/config')
  const mockPrebidConfig = getMockPrebidConfig()
  config.getConfig.mockImplementation((key = null) => {
    if (key) {
      return mockPrebidConfig[key]
    }
    return mockPrebidConfig
  })

  // Use our mock window value.
  // https://stackoverflow.com/a/56999581
  windowSpy = jest.spyOn(global, 'window', 'get')
  windowSpy.mockImplementation(() => getMockWindow())
})

describe('Prebid.js patch: refererDetection.js', () => {
  test('getRefererInfo uses the publisher info in the Prebid config to populate values', () => {
    const { config } = require('../node_modules/prebid.js/src/config')
    const mockPrebidConfig = {
      ...getMockPrebidConfig(),
      publisherDomain: 'https://foo.com',
      pageUrl: 'https://foo.com/something/',
    }
    config.getConfig.mockImplementation((key = null) => {
      if (key) {
        return mockPrebidConfig[key]
      }
      return mockPrebidConfig
    })

    const { getRefererInfo } = require(`${prebidSrcPath}/refererDetection`)

    // Without our patch to Prebid, the topmostLocation would be
    // 'chrome-extension://abcdefghijklmnopqrs' and numIframes would be 1.
    const pageUrl = 'https://foo.com/something/'
    expect(getRefererInfo()).toEqual({
      reachedTop: true,
      isAmp: false,
      numIframes: 0,
      stack: [pageUrl],
      topmostLocation: pageUrl,
      location: pageUrl,
      canonicalUrl: pageUrl,
      page: pageUrl,
      domain: 'foo.com',
      ref: pageUrl,
      legacy: {
        isAmp: false,
        canonicalUrl: null,
        numIframes: 0,
        reachedTop: true,
        referer: pageUrl,
        stack: [pageUrl],
      },
    })
  })

  test('getRefererInfo uses the window href if the Prebid config does not set the pageUrl value', () => {
    const { config } = require('../node_modules/prebid.js/src/config')
    const mockPrebidConfig = {
      ...getMockPrebidConfig(),
      pageUrl: null,
    }
    config.getConfig.mockImplementation((key = null) => {
      if (key) {
        return mockPrebidConfig[key]
      }
      return mockPrebidConfig
    })

    const { getRefererInfo } = require(`${prebidSrcPath}/refererDetection`)
    const pageUrl = 'https://tab.gladly.io/newtab/' // set in mock window
    expect(getRefererInfo()).toEqual({
      reachedTop: true,
      isAmp: false,
      numIframes: 0,
      stack: [pageUrl],
      topmostLocation: pageUrl,
      location: pageUrl,
      canonicalUrl: pageUrl,
      page: pageUrl,
      domain: 'tab.gladly.io',
      ref: pageUrl,
      legacy: {
        isAmp: false,
        canonicalUrl: null,
        numIframes: 0,
        reachedTop: true,
        referer: pageUrl,
        stack: [pageUrl],
      },
    })
  })
})
