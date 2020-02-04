import adsEnabled from 'src/adsEnabledStatus'
import googleDisplayAd from 'src/google/googleDisplayAd'
import mockDisplayAd from 'src/mockDisplayAd'

export default adId => {
  if (adsEnabled()) {
    googleDisplayAd(adId)
  } else {
    mockDisplayAd(adId)
  }
}
