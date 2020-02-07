/* eslint-disable import/prefer-default-export */
import getAds from 'src/fetchAds'
import logger from 'src/utils/logger'

export const fetchAds = async config => {
  logger.debug(`Called "fetchAds" with config: ${JSON.stringify(config)}`)
  await getAds(config)
}
