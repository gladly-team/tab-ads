/* eslint-disable import/prefer-default-export */
import getAds from 'src/fetchAds'
import { getAllWinningBids as getAllWinningBidsForAds } from 'src/utils/getWinningBids'
import ReactAdComponent from 'src/AdComponent'
import getNewTabAdUnits from 'src/getAvailableAdUnits'
import getGlobal from 'src/utils/getGlobal'

export const fetchAds = async config => {
  await getAds(config)
}

export const AdComponent = ReactAdComponent

export const getAvailableAdUnits = getNewTabAdUnits

// Expose functions to the global variable that are helpful
// for debugging in devtools.
const global = getGlobal()
global.tabAds = global.tabAds || {}
global.tabAds.getAllWinningBids = getAllWinningBidsForAds
