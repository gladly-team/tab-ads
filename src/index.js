/* eslint-disable import/prefer-default-export */
import getAds from 'src/fetchAds'

export const fetchAds = async config => {
  // eslint-disable-next-line no-console
  console.log(`Called "fetchAds" with config: ${JSON.stringify(config)}`)
  await getAds(config)
}
