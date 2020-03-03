import { filter } from 'lodash/collection'
import { get } from 'lodash/object'
import getAmazonTag from 'src/providers/amazon/getAmazonTag'
import Bidder from 'src/utils/Bidder'
import BidResponse from 'src/utils/BidResponse'
import logger from 'src/utils/logger'

const amazonBidderName = 'amazon'

/**
 * Given an ad ID and the tab-ads config, return the first listed
 * size for that ad ID. This is because Amazon does not return useful
 * size info.
 * @param {Object} config - the tab-ads config object
 * @param {String} adId - the ad ID
 * @return {String} A string of the size, such as "728x90"
 */
const getAdSizeByAdId = (config, adId) => {
  const newTabAds = get(config, 'newTabAds')
  const adInfo = get(filter(newTabAds, { adId }), '[0]', {})
  const sizeArray = get(adInfo, 'sizes.[0]', [0, 0]) // default to 0x0
  return `${sizeArray[0]}x${sizeArray[1]}`
}

/**
 * Given Amazon bid responses, return an object with keys set to adIds
 * and values set to an array of BidResponses for that adId.
 * @param {Object} config - the tab-ads config object
 * @param {Array} rawBidData - Amazon's bid response
 * @return {Object} bidResponses - An object with keys equal to each adId
 *   for which there's a bid and values with an array of BidResponses, the
 *   bidder's normalized bids for that ad.
 */
const normalizeBidResponses = (config, rawBidData = []) => {
  // Raw bid object structure:
  // {
  //   amznbid: '1', // the encoded CPM value
  //   amzniid: 'some-id',
  //   amznp: '1',
  //   amznsz: '0x0',
  //   size: '0x0',
  //   slotID: 'div-gpt-ad-123456789-0'
  // }
  const normalizeBid = (adId, rawBid) => {
    // If either amznbid or amazniid are nil or an empty string,
    // that means there's no bid.
    if (!(rawBid.amzniid && rawBid.amznbid)) {
      return null
    }

    // Get the ad size from the tab-ads config because Amazon does
    // not return useful ad size info.
    const size = getAdSizeByAdId(config, adId)
    return BidResponse({
      adId,
      encodedRevenue: rawBid.amznbid,
      advertiserName: amazonBidderName,
      adSize: size,
    })
  }

  const normalizedBids = rawBidData.reduce((accumulator, rawBid) => {
    return {
      ...accumulator,
      [rawBid.slotID]: [normalizeBid(rawBid.slotID, rawBid)].filter(
        item => !!item
      ), // filter any nil bids
    }
  }, {})

  return normalizedBids
}

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
    function handleAuctionEnd(rawBids) {
      logger.debug(`Amazon: auction ended`)
      resolve({
        bidResponses: normalizeBidResponses(config, rawBids),
        rawBidResponses: rawBids,
      })
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
        handleAuctionEnd(bids)
      }
    )
  })
}

const setTargeting = () => {
  const apstag = getAmazonTag()
  apstag.setDisplayBids()
  logger.debug(`Amazon: set ad server targeting`)
}

const AmazonBidder = Bidder({
  name: amazonBidderName,
  fetchBids,
  setTargeting,
})

export default AmazonBidder
