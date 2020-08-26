import logger from 'src/utils/logger'

/**
 * Call the consent management platform and return
 * the US privacy string value. Return null if the
 * call to the CMP times out
 * @param {Object} options
 * @param {Number} options.timeout - time in ms to wait for
 *   the CMP to respond.
 * @return {String|null} the USP string value, or null if
 *   the CMP times out.
 */
const getUSPString = async ({ timeout = 500 } = {}) => {
  // TODO: call uspapi
  // TODO: use timeout
  logger.debug(`Fetching USP string with timeout ${timeout}ms.`)
  return '1YYN'
}

export default getUSPString
