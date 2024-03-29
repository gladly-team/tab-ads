/* eslint-disable import/prefer-default-export */

import { get } from 'lodash/object'
import { isArray, isNil } from 'lodash/lang'
import queue from 'src/utils/queue'
import getURL from 'src/utils/getURL'
import getAvailableAdUnits from 'src/getAvailableAdUnits'

const newTabAdUnits = getAvailableAdUnits()

const defaultConfig = {
  disableAds: false, // true if we should't call for bids
  // Set "useMockAds" to true if we should display fake ad content. This
  // is for development only and only if "disableAds" is also true.
  useMockAds: false,
  adUnits: [
    // Let the calling app decide which ads to show. This is the
    // setting to use all ads:
    // {
    //   // The long leaderboard ad.
    //   adId: 'div-gpt-ad-1464385677836-0',
    //   adUnitId: '/43865596/HBTL',
    //   sizes: [[728, 90]],
    //   allowedAdSlotSizes: [[728, 90]],
    // },
    // {
    //   // The primary rectangle ad (bottom-right).
    //   adId: 'div-gpt-ad-1464385742501-0',
    //   adUnitId: '/43865596/HBTR',
    //   sizes: [[300, 250]],
    //   allowedAdSlotSizes: [[300, 250]],
    // },
    // {
    //   // The second rectangle ad (right side, above the first).
    //   adId: 'div-gpt-ad-1539903223131-0',
    //   adUnitId: '/43865596/HBTR2',
    //   sizes: [[300, 250]],
    //   allowedAdSlotSizes: [[300, 250]],
    // },
  ],
  pageLevelKeyValues: {},
  auctionTimeout: 1000, // Timeout for the whole auction
  bidderTimeout: 700, // Timeout of the individual bidders
  consent: {
    // If false, most bidders won't include TCF/USP data or wait for
    // the CMP to respond.
    enabled: true,
    // Time to wait for the consent management platform (CMP) to respond.
    // If the CMP does not respond in this time, ad auctions may be cancelled.
    // Typically, 500ms might be too short for a CMP to load and respond.
    // However, the tab-cmp package aims to make the CMP respond much more
    // quickly (sub-50ms) after the user's first page load.
    timeout: 500,
  },
  publisher: {
    pageUrl: null, // required to be provided by user
  },
  // Convenience to distinguish between the ads.
  newTabAds: newTabAdUnits,
  logLevel: 'error',
  // onError: () => {}, // required to be provided by user
}

let config

// Throw if the provided config is inadequate.
const validateConfig = (userConfig) => {
  // Validate the onError handler.
  if (isNil(get(userConfig, 'onError'))) {
    throw new Error('Config error: the onError property must be set.')
  }
  if (typeof get(userConfig, 'onError') !== 'function') {
    throw new Error('Config error: the onError property must be a function.')
  }

  // Validate publisher values.
  if (isNil(get(userConfig, 'publisher.pageUrl'))) {
    throw new Error('Config error: the publisher.pageUrl property must be set.')
  }
  if (typeof get(userConfig, 'publisher.pageUrl') !== 'string') {
    throw new Error(
      'Config error: the publisher.pageUrl property must be a string.'
    )
  }

  // Validate adUnits.
  const userAdUnits = get(userConfig, 'adUnits', [])
  userAdUnits.forEach((adUnit) => {
    if (isNil(adUnit.adId)) {
      throw new Error(
        'Config error: adUnits objects must have an "adId" property.'
      )
    }
    if (typeof adUnit.adId !== 'string') {
      throw new Error(
        'Config error: adUnits\' "adId" property must be a string.'
      )
    }
    if (isNil(adUnit.adUnitId)) {
      throw new Error(
        'Config error: adUnits objects must have an "adUnitId" property.'
      )
    }
    if (typeof adUnit.adUnitId !== 'string') {
      throw new Error(
        'Config error: adUnits\' "adUnitId" property must be a string.'
      )
    }
    if (isNil(adUnit.sizes)) {
      throw new Error(
        'Config error: adUnits objects must have an "sizes" property.'
      )
    }
    if (!isArray(adUnit.sizes)) {
      throw new Error(
        'Config error: adUnits\' "sizes" property must be an array.'
      )
    }
    if (!adUnit.sizes.length) {
      throw new Error(
        'Config error: adUnits\' "sizes" property must have at least one size specified.'
      )
    }
  })

  // Validate pageLevelKeyValues.
  if (
    userConfig.pageLevelKeyValues !== undefined &&
    typeof userConfig.pageLevelKeyValues !== 'object'
  ) {
    throw new Error('Config error: Key Values must be in an object')
  }
  const pageLevelKeyValues = get(userConfig, 'pageLevelKeyValues', {})
  Object.entries(pageLevelKeyValues).forEach((keyValuePair) => {
    if (typeof keyValuePair[1] !== 'string') {
      throw new Error('Config error: values in key value pair must be strings')
    }
  })

  // Validate consent values.
  if (
    get(userConfig, 'consent.enabled') &&
    !(typeof get(userConfig, 'consent.enabled') === 'boolean')
  ) {
    throw new Error(
      'Config error: the consent.enabled property must be a boolean.'
    )
  }
}

const isDebugParamSet = () => {
  let isDebug = false
  try {
    const urlStr = getURL()
    const url = new URL(urlStr)
    const tabAdsDebug = url.searchParams.get('tabAdsDebug')
    isDebug = tabAdsDebug === 'true'
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return isDebug
}

export const setConfig = (userConfig) => {
  validateConfig(userConfig)
  const fullConfig = {
    ...defaultConfig,
    ...(userConfig || {}),
    // Override the log level if ?tabAdsDebug=true
    logLevel: isDebugParamSet()
      ? 'debug'
      : userConfig.logLevel || defaultConfig.logLevel,
    consent: {
      ...defaultConfig.consent,
      ...get(userConfig, 'consent', {}),
    },
    publisher: {
      ...defaultConfig.publisher,
      ...get(userConfig, 'publisher', {}),
    },
    newTabAds: defaultConfig.newTabAds, // Don't allow modifying this.
  }
  config = fullConfig

  // The command queue is waiting for the tab-ads config to be
  // set. Execute tab-ads queue and set it to auto-run future
  // commands.
  queue.runQueue(true)

  return fullConfig
}

export const getConfig = () => {
  if (!config) {
    throw new Error('You must call `setConfig` before using the config.')
  }
  return config
}
