// Time to wait for the entire ad auction before
// calling the ad server.
export const AUCTION_TIMEOUT = 1000

// Time to wait for the consent management platform (CMP)
// to respond.
export const CONSENT_MANAGEMENT_TIMEOUT = 50

// Timeout for individual bidders.
export const BIDDER_TIMEOUT = 700

// "Vertical ad" = the ad that's typically rectangular
// or taller than it is wide. Historically, the right-side
// rectangle ad.
export const VERTICAL_AD_UNIT_ID = '/43865596/HBTR'
export const VERTICAL_AD_SLOT_DOM_ID = 'div-gpt-ad-1464385742501-0'

// "Second vertical ad" = the extra rectangle ad.
export const SECOND_VERTICAL_AD_UNIT_ID = '/43865596/HBTR2'
export const SECOND_VERTICAL_AD_SLOT_DOM_ID = 'div-gpt-ad-1539903223131-0'

// "Horizontal ad" = the ad that's typically wider than
// it is tall. Historically, the bottom long leaderboard ad.
export const HORIZONTAL_AD_UNIT_ID = '/43865596/HBTL'
export const HORIZONTAL_AD_SLOT_DOM_ID = 'div-gpt-ad-1464385677836-0'

/**
 * Get the number of banner ads to show on the new tab page.
 * @return {Number} The number of ads
 */
export const getNumberOfAdsToShow = () => {
  // TODO: this should come from the app in configuration
  return 3
}

/**
 * Get an array of ad sizes (each an array with two numbers)
 * of the acceptable ad sizes to display for the veritcal
 * ad.
 * @return {Array[Array]} An array of ad sizes
 */
export const getVerticalAdSizes = () => [[300, 250]]

/**
 * Get an array of ad sizes (each an array with two numbers)
 * of the acceptable ad sizes to display for the horizontal
 * ad.
 * @return {Array[Array]} An array of ad sizes
 */
export const getHorizontalAdSizes = () => [[728, 90]]
