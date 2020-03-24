import { find } from 'lodash/collection'
import googleDisplayAd from 'src/google/googleDisplayAd'
import { getConfig } from 'src/config'
import queue from 'src/utils/queue'
import getGlobal from 'src/utils/getGlobal'

const global = getGlobal()

const mockDisplayAd = (adId, config) => {
  let mockNetworkDelayMs = 0
  const useMockDelay = false
  if (useMockDelay) {
    mockNetworkDelayMs = Math.random() * (1500 - 900) + 900
  }
  const adUnit = find(config.adUnits, { adId })

  // Use the height of the first specified size of this ad unit.
  const height = adUnit && adUnit.sizes ? adUnit.sizes[0][1] : 0

  // Mock returning an ad.
  setTimeout(() => {
    const elem = global.document.getElementById(adId)
    if (!elem) {
      return
    }
    elem.setAttribute(
      'style',
      `
      color: white;
      background: repeating-linear-gradient(
        -55deg,
        #222,
        #222 20px,
        #333 20px,
        #333 40px
      );
      width: 100%;
      height: ${height}px;
    `
    )
  }, mockNetworkDelayMs)
}

export default adId => {
  // `fetchAds` may not have been called yet, so queue
  // any commands that rely on the config.
  queue(() => {
    const config = getConfig()
    if (!config.disableAds) {
      googleDisplayAd(adId)
    } else if (config.useMockAds) {
      mockDisplayAd(adId, config)
    }
  })
}
