import getAds from 'src/ads'
import logger from 'src/utils/logger'

export const fetchAds = async config => {
  logger.debug(`Called "fetchAds" with config: ${JSON.stringify(config)}`)
  await getAds(config)
}

export const displayAd = async adId => {
  logger.debug(`Called "displayAd" with adId: ${adId}`)
}
