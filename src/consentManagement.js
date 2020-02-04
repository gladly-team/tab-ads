import logger from 'src/utils/logger'

/**
 * Get the vendor consent string from the consent management platform.
 * @return {Promise<string|null>} A promise that resolves into the
 *   consent string, or null if there was an error getting the string
 */
export const getConsentString = () => {
  return new Promise(resolve => {
    function cmpSuccessCallback(consentData) {
      if (!consentData) {
        resolve(null)
      }
      resolve(consentData.consentData)
    }

    // If the CMP throws any error, just return null.
    try {
      window.__cmp('getConsentData', null, cmpSuccessCallback)
    } catch (e) {
      logger.error(e)
      resolve(null)
    }
  })
}

/**
 * Get whether the user has provided global consent for all uses.
 * @return {Promise<boolean|null>} A promise that resolves into a
 *   boolean, or null if there was an error getting the data
 */
export const hasGlobalConsent = () => {
  return new Promise(resolve => {
    function cmpSuccessCallback(consentData) {
      if (!consentData) {
        resolve(null)
      }
      resolve(consentData.hasGlobalConsent)
    }

    // If the CMP throws any error, just return null.
    try {
      window.__cmp('getConsentData', null, cmpSuccessCallback)
    } catch (e) {
      logger.error(e)
      resolve(null)
    }
  })
}

/**
 * Call the CMP to display the consent UI.
 * @return {undefined}
 */
export const displayConsentUI = () => {
  try {
    window.__cmp('displayConsentUi')
  } catch (e) {
    logger.error(e)
  }
}
