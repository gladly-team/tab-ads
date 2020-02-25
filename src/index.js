/* eslint-disable import/prefer-default-export */
import getAds from 'src/fetchAds'
import { getAllWinningBids as getAllWinningBidsForAds } from 'src/utils/getWinningBids'

export const fetchAds = async config => {
  await getAds(config)
}

export const getAllWinningBids = getAllWinningBidsForAds

// Expose functions to the global variable that are helpful
// for debugging in devtools.
window.tabAds = window.tabAds || {}
window.tabAds.getAllWinningBids = getAllWinningBids
