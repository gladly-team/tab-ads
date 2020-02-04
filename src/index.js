import prebid from 'src/providers/prebid/prebid'

export const fetchAds = async config => {
  console.log('Called `fetchAds` with config:', config) // eslint-disable-line no-console
  await prebid()
}

export const displayAd = async adId => {
  console.log('Called `displayAd` with adId:', adId) // eslint-disable-line no-console
}
