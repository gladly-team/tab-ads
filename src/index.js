/* eslint-disable import/prefer-default-export */
import getAds from 'src/fetchAds'

export const fetchAds = async config => {
  // eslint-disable-next-line no-console
  console.log(`Called "fetchAds" with config: ${JSON.stringify(config)}`)
  await getAds(config)
}

export const getAllWinningBids = () => {
  // eslint-disable-next-line no-console
  console.log('TODO')
}

// Expose functions to the global variable that are helpful
// for debugging in devtools.
window.tabAds = window.tabAds || {}
window.tabAds.getAllWinningBids = getAllWinningBids
