/* eslint-disable import/prefer-default-export */

import { get } from 'lodash/object'

const defaultConfig = {
  disableAds: false, // true if we should't call for bids
  // Set "useMockAds" to true if we should display fake ad content. This
  // is for development only and only if "disableAds" is also true.
  useMockAds: false,
  // TODO: pass array to know which ads to load.
  // For now, we'll hardcode them.
  adUnits: [
    {
      // The long leaderboard ad.
      adId: 'div-gpt-ad-1464385677836-0',
      adUnitId: '/43865596/HBTL',
      sizes: [[728, 90]],
    },
    {
      // The primary rectangle ad (bottom-right).
      adId: 'div-gpt-ad-1464385742501-0',
      adUnitId: '/43865596/HBTR',
      sizes: [[300, 250]],
    },
    {
      // The second rectangle ad (right side, above the first).
      adId: 'div-gpt-ad-1539903223131-0',
      adUnitId: '/43865596/HBTR2',
      sizes: [[300, 250]],
    },
  ],
  auctionTimeout: 1000, // Timeout for the whole auction
  bidderTimeout: 700, // Timeout of the individual bidders
  consent: {
    // An async function that resolves to true if the user is in the European Union.
    isEU: () => Promise.resolve(false), // TODO: require this to be passed
    timeout: 50, // Time to wait for the consent management platform (CMP) to respond
  },
  publisher: {
    domain: 'tab.gladly.io', // TODO: require this to be passed
    pageUrl: 'https://tab.gladly.io/newtab/', // TODO: require this to be passed
  },
  // Convenience to distinguish between the ads.
  newTabAds: {
    leaderboard: {
      // The long leaderboard ad.
      adId: 'div-gpt-ad-1464385677836-0',
      adUnitId: '/43865596/HBTL',
      sizes: [[728, 90]],
    },
    rectangleAdPrimary: {
      // The primary rectangle ad (bottom-right).
      adId: 'div-gpt-ad-1464385742501-0',
      adUnitId: '/43865596/HBTR',
      sizes: [[300, 250]],
    },
    rectangleAdSecondary: {
      // The second rectangle ad (right side, above the first).
      adId: 'div-gpt-ad-1539903223131-0',
      adUnitId: '/43865596/HBTR2',
      sizes: [[300, 250]],
    },
  },
  logLevel: 'debug', // TODO: change the default to "error"
}

let config = defaultConfig

export const setConfig = userConfig => {
  const fullConfig = {
    ...defaultConfig,
    ...(userConfig || {}),
    consent: {
      ...defaultConfig.consent,
      ...get(userConfig, 'consent', {}),
    },
    publisher: {
      ...defaultConfig.publisher,
      ...get(userConfig, 'publisher', {}),
    },
    adUnits: defaultConfig.adUnits, // Don't allow modifying this right now.
    newTabAds: defaultConfig.newTabAds, // Don't allow modifying this.
  }
  config = fullConfig
  return fullConfig
}

export const getConfig = () => {
  return config
}
