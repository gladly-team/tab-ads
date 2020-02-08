import getPrebidPbjs from 'src/providers/prebid/getPrebidPbjs'
import logger from 'src/utils/logger'

// TODO: assumes we are showing all 3 ads. Make that configurable.
const getAdUnits = config => {
  const {
    leaderboard,
    rectangleAdPrimary,
    rectangleAdSecondary,
  } = config.newTabAds

  const adUnits = [
    // Leaderboard-style ad
    {
      code: leaderboard.adId,
      mediaTypes: {
        banner: {
          sizes: leaderboard.sizes,
        },
      },
      bids: [
        {
          bidder: 'sonobi',
          params: {
            dom_id: leaderboard.adId,
            ad_unit: leaderboard.adUnitId,
          },
        },
        {
          bidder: 'pulsepoint',
          params: {
            cf: '728X90',
            cp: '560174',
            ct: '460981',
          },
        },
        {
          bidder: 'aol',
          params: {
            network: '10559.1',
            placement: '4117691',
            sizeId: '225',
          },
        },
        {
          bidder: 'sovrn',
          params: {
            tagid: '438918',
          },
        },
        {
          bidder: 'openx',
          params: {
            unit: '538658529',
            delDomain: 'tabforacause-d.openx.net',
          },
        },
        // EMX Digital was formerly brealtime.
        // http://prebid.org/dev-docs/bidders.html#emx_digital
        {
          bidder: 'emx_digital',
          params: {
            tagid: '29672',
          },
        },
        {
          bidder: 'rhythmone',
          params: {
            placementId: '73423',
          },
        },
      ],
    },

    // Rectangle-style ad
    {
      code: rectangleAdPrimary.adId,
      mediaTypes: {
        banner: {
          sizes: rectangleAdPrimary.sizes,
        },
      },
      bids: [
        {
          bidder: 'sonobi',
          params: {
            dom_id: rectangleAdPrimary.adId,
            ad_unit: rectangleAdPrimary.adUnitId,
          },
        },
        {
          bidder: 'pulsepoint',
          params: {
            cf: '300X250',
            cp: '560174',
            ct: '460982',
          },
        },
        {
          bidder: 'aol',
          params: {
            network: '10559.1',
            placement: '4117692',
            sizeId: '170',
          },
        },
        {
          bidder: 'sovrn',
          params: {
            tagid: '438916',
          },
        },
        {
          bidder: 'openx',
          params: {
            unit: '538658529',
            delDomain: 'tabforacause-d.openx.net',
          },
        },
        {
          bidder: 'emx_digital',
          params: {
            tagid: '29673',
          },
        },
        {
          bidder: 'rhythmone',
          params: {
            placementId: '73423',
          },
        },
      ],
    },

    // Second rectangle-style ad
    {
      code: rectangleAdSecondary.adId,
      mediaTypes: {
        banner: {
          sizes: rectangleAdSecondary.sizes,
        },
      },
      bids: [
        {
          bidder: 'sonobi',
          params: {
            dom_id: rectangleAdSecondary.adId,
            ad_unit: rectangleAdSecondary.adUnitId,
          },
        },
        {
          bidder: 'pulsepoint',
          params: {
            cf: '300X250',
            cp: '560174',
            ct: '665497',
          },
        },
        {
          bidder: 'aol',
          params: {
            network: '10559.1',
            placement: '4997858',
            sizeId: '170',
          },
        },
        {
          bidder: 'sovrn',
          params: {
            tagid: '589343',
          },
        },
        {
          bidder: 'openx',
          params: {
            unit: '538658529',
            delDomain: 'tabforacause-d.openx.net',
          },
        },
        // {
        //   bidder: 'emx_digital',
        //   params: {
        //     tagid: 'TODO'
        //   }
        // },
        {
          bidder: 'rhythmone',
          params: {
            placementId: '73423',
          },
        },
      ],
    },
  ]

  return adUnits
}

/**
 * Return a promise that resolves when the Prebid auction is
 * complete. For a setup example, see:
 * http://prebid.org/dev-docs/examples/basic-example.html
 * @return {Promise<undefined>} Resolves when the Prebid
 *   auction completes (either all bids back or bid requests
 *   time out).
 */
export default async config => {
  logger.debug(`Prebid: bids requested`)

  // Determine if the user is in the EU, which may affect the
  // ads we show.
  let isInEU
  try {
    isInEU = await config.consent.isEU()
  } catch (e) {
    isInEU = false
  }
  return new Promise(resolve => {
    function handleAuctionEnd() {
      logger.debug(`Prebid: auction ended`)
      resolve()
    }

    const requiresConsentManagement = !!isInEU

    const adUnits = getAdUnits(config)

    const pbjs = getPrebidPbjs()

    pbjs.que.push(() => {
      pbjs.setConfig({
        // bidderTimeout: 700 // default
        publisherDomain: config.publisher.domain, // Used for SafeFrame creative
        // Overrides the page URL adapters should use. Otherwise, some adapters
        // will use the current frame's URL while others use the top frame URL.
        // Only some adapters use this setting as of May 2018.
        // https://github.com/prebid/Prebid.js/issues/1882
        pageUrl: config.publisher.pageUrl,
        userSync: {
          filterSettings: {
            // EMX Digital requested iframe syncing on 13 Nov 2018 due to
            // poor ad performance.
            iframe: {
              bidders: 'emx_digital',
              filter: 'include',
            },
          },
        },
        // GDPR consent. Only enable the consentManagement module here
        // if consent is required, to avoid the unnecessary delay of calling
        // the CMP.
        // http://prebid.org/dev-docs/modules/consentManagement.html
        ...(requiresConsentManagement && {
          consentManagement: {
            cmpApi: 'iab',
            timeout: config.consent.timeout,
            allowAuctionWithoutConsent: true,
          },
        }),
      })

      pbjs.addAdUnits(adUnits)
      pbjs.bidderSettings = {
        aol: {
          // AOL sends gross CPM.
          bidCpmAdjustment(bidCpm) {
            return bidCpm * 0.8
          },
        },
      }

      pbjs.requestBids({
        bidsBackHandler: handleAuctionEnd,
      })
    })
  })
}
