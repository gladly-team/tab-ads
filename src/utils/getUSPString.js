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
  return new Promise((resolve) => {
    try {
      let timedOut = false
      logger.debug(`Fetching USP string with timeout ${timeout}ms.`)
      const timeoutInstance = setTimeout(() => {
        logger.debug(
          `Failed to get USP data. Timed out while waiting for the CMP.`
        )
        timedOut = true
        resolve(null)
      }, timeout)
      window.__uspapi('getUSPData', 1, (uspData, success) => {
        if (timedOut) {
          return
        }
        clearTimeout(timeoutInstance)
        if (success) {
          logger.debug(`Received USP data:`, uspData)
          resolve(uspData.uspString)
        } else {
          logger.debug(`Failed to get USP data. The CMP errored.`)
          resolve(null)
        }
      })
    } catch (e) {
      resolve(null)
      logger.error(e)
    }
  })
}

export default getUSPString
