export default () => ({
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
    allowedAdSlotSizes: [[728, 90]],
  },
  rectangleAdPrimary: {
    // The primary rectangle ad (bottom-right).
    adId: 'div-gpt-ad-1464385742501-0',
    adUnitId: '/43865596/HBTR',
    sizes: [[300, 250]],
    allowedAdSlotSizes: [[300, 250]],
  },
  rectangleAdSecondary: {
    // The second rectangle ad (right side, above the first).
    adId: 'div-gpt-ad-1539903223131-0',
    adUnitId: '/43865596/HBTR2',
    sizes: [[300, 250]],
    allowedAdSlotSizes: [[300, 250]],
  },
})
