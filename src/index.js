import getAds from 'src/fetchAds'
import ReactAdComponent from 'src/AdComponent'
import getNewTabAdUnits from 'src/getAvailableAdUnits'
import getGlobal from 'src/utils/getGlobal'
import { isClientSide } from 'src/utils/ssr'

export const fetchAds = async config => {
  if (!isClientSide()) {
    throw new Error(
      'The tab-ads package can only fetch ads in the browser environment.'
    )
  }
  await getAds(config)
}

export const AdComponent = ReactAdComponent

export const getAvailableAdUnits = getNewTabAdUnits

// Expose functions to the global variable that are helpful
// for debugging in devtools.
const global = getGlobal()
global.tabAds = global.tabAds || {}

global.tabAds.getAllWinningBids = () => {
  if (!isClientSide()) {
    throw new Error(
      'The tab-ads package can only get winning bids in the browser environment.'
    )
  }
  const { getAllWinningBids } = require('src/utils/getWinningBids').default
  return getAllWinningBids()
}
