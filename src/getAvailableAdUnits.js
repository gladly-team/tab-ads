const adUnitConfig = {
  leaderboard: {
    // The long leaderboard ad.
    adId: 'div-gpt-ad-1464385677836-0',
    adUnitId: '/43865596/HBTL',
    // Sizes sent to bidders.
    sizes: [[728, 90]],
    // Sizes allowed to be served from the ad server. This
    // cab include more options so that, e.g., custom in-house
    // ad campaigns can have unique sizes but programmatic
    // bidders do not.
    allowableAdSlotSizes: [[728, 90]],
  },
  rectangleAdPrimary: {
    // The primary rectangle ad (bottom-right).
    adId: 'div-gpt-ad-1464385742501-0',
    adUnitId: '/43865596/HBTR',
    sizes: [[300, 250]],
    allowableAdSlotSizes: [[300, 250]],
  },
  rectangleAdSecondary: {
    // The second rectangle ad (right side, above the first).
    adId: 'div-gpt-ad-1539903223131-0',
    adUnitId: '/43865596/HBTR2',
    sizes: [[300, 250]],
    allowableAdSlotSizes: [[300, 250]],
  },
}

export const getAdUnitConfig = () => adUnitConfig

// Format the ad unit config into the expected shape used
// by the API method `getAvailableAdUnits`.
// Includes properties: adId, adUnitId, sizes
const availableAdUnits = Object.keys(adUnitConfig).reduce(
  (newConfig, currentKey) => {
    const itemConfig = adUnitConfig[currentKey]
    const { adId, adUnitId, sizes } = itemConfig

    // eslint-disable-next-line no-param-reassign
    newConfig[currentKey] = {
      adId,
      adUnitId,
      sizes,
    }
    return newConfig
  },
  {}
)

const getAvailableAdUnits = () => availableAdUnits

export default getAvailableAdUnits
