import { get } from 'lodash/object'
import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import Bidder from 'src/utils/Bidder'
import BidResponse from 'src/utils/BidResponse'
import logger from 'src/utils/logger'
import { getAdDataStore } from 'src/utils/storage'

// Save returned Amazon bids.
let amazonBids

/**
 * If there are Amazon bids, store them in the tabforacause
 * global object for use with analytics. Only do this if the
 * Amazon bids return early enough to be included in the ad
 * server request; otherwise, the bids are not meaningful.
 * @return {undefined}
 */
export const storeAmazonBids = () => {
  // Bid object structure:
  // {
  //   amznbid: '1',
  //   amzniid: 'some-id',
  //   amznp: '1',
  //   amznsz: '0x0',
  //   size: '0x0',
  //   slotID: 'div-gpt-ad-123456789-0'
  // }
  const adDataStore = getAdDataStore()
  try {
    if (amazonBids && amazonBids.length) {
      amazonBids.forEach(bid => {
        adDataStore.amazonBids[bid.slotID] = bid
      })
    }
  } catch (e) {
    logger.error(e)
  }
}

// FIXME
/**
 * Given Amazon bid responses, return an object with keys set to adIds
 * and values set to an array of BidResponses for that adId.
 * @param {Array} rawBidData - Amazon's bid response
 * @return {Object} bidResponses - An object with keys equal to each adId
 *   for which there's a bid and values with an array of BidResponses, the
 *   bidder's normalized bids for that ad.
 */
const normalizeBidResponses = (rawBidData = {}) => {
  // Raw bid object structure:
  // {
  //   amznbid: '1',
  //   amzniid: 'some-id',
  //   amznp: '1',
  //   amznsz: '0x0',
  //   size: '0x0',
  //   slotID: 'div-gpt-ad-123456789-0'
  // }

  // TODO
  return {}
}

// FIXME: return correct value
/**
 * Return a promise that resolves when the Amazon bids
 * return or the request times out. See:
 * https://ams.amazon.com/webpublisher/uam/docs/web-integration-documentation/integration-guide/javascript-guide/api-reference.html
 * @return {Promise<undefined>} Resolves when the Amazon
 *   bid requests return or time out.
 */
const fetchBids = async config => {
  const apstag = getAmazonTag()

  const slots = config.adUnits.map(adUnit => {
    return {
      slotID: adUnit.adId,
      sizes: adUnit.sizes,
    }
  })

  return new Promise(resolve => {
    function handleAuctionEnd() {
      logger.debug(`Amazon: auction ended`)
      resolve()
    }
    apstag.init({
      pubID: 'ea374841-51b0-4335-9960-99200427f7c8',
      adServer: 'googletag',
      gdpr: {
        cmpTimeout: config.consent.timeout,
      },
    })

    logger.debug(`Amazon: bids requested`)
    apstag.fetchBids(
      {
        slots,
        timeout: config.bidderTimeout,
      },
      bids => {
        amazonBids = bids
        handleAuctionEnd()
      }
    )
  })
}

// FIXME
const setTargeting = () => {
  // TODO
  logger.debug(`Amazon: set ad server targeting`)
}

const name = 'amazon'

const AmazonBidder = Bidder({
  name,
  fetchBids,
  setTargeting,
})

export default AmazonBidder
