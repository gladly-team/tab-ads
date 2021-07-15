/* eslint-env jest */

import getAvailableAdUnits from 'src/getAvailableAdUnits'

describe('getAvailableAdUnits', () => {
  it('exports the expected value for ad units', () => {
    expect(getAvailableAdUnits()).toEqual({
      leaderboard: {
        // The long leaderboard ad.
        adId: 'div-gpt-ad-1464385677836-0',
        adUnitId: '/43865596/HBTL',
        // Sizes sent to bidders.
        sizes: [[728, 90]],
        // Sizes allowed to be served from the ad server. This
        // can include more options so that, e.g., custom in-house
        // ad campaigns can have unique sizes but programmatic
        // bidders do not.
        allowedAdSlotSizes: [
          [728, 90],
          [1, 1],
          [468, 60],
          [728, 210],
          [720, 300],
          [970, 250], // billboard
          [728, 250], // internal custom
          [728, 300], // internal custom
          [728, 350], // internal custom
          [728, 400], // internal custom
          [970, 250], // internal custom
          [970, 300], // internal custom
          [970, 350], // internal custom
          [970, 400], // internal custom
        ],
      },
      rectangleAdPrimary: {
        // The primary rectangle ad (bottom-right).
        adId: 'div-gpt-ad-1464385742501-0',
        adUnitId: '/43865596/HBTR',
        sizes: [[300, 250]],
        allowedAdSlotSizes: [
          [300, 250],
          [1, 1],
          [250, 250],
          [160, 600],
          [120, 600],
          [120, 240],
          [240, 400],
          [234, 60],
          [180, 150],
          [125, 125],
          [120, 90],
          [120, 60],
          [120, 30],
          [230, 33],
          [300, 600],
        ],
      },
      rectangleAdSecondary: {
        // The second rectangle ad (right side, above the first).
        adId: 'div-gpt-ad-1539903223131-0',
        adUnitId: '/43865596/HBTR2',
        sizes: [[300, 250]],
        allowedAdSlotSizes: [
          [300, 250],
          [1, 1],
          [250, 250],
          [160, 600],
          [120, 600],
          [120, 240],
          [240, 400],
          [234, 60],
          [180, 150],
          [125, 125],
          [120, 90],
          [120, 60],
          [120, 30],
          [230, 33],
          [300, 600],
        ],
      },
    })
  })
})
