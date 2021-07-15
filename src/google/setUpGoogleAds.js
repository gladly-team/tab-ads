import getGoogleTag from 'src/google/getGoogleTag'

export default (config) => {
  const { adUnits, pageLevelKeyValues = {} } = config
  if (!adUnits.length) {
    return
  }
  const googletag = getGoogleTag()

  // Set up each ad unit.
  adUnits.forEach((adUnit) => {
    const sizes = adUnit.allowedAdSlotSizes || adUnit.sizes
    googletag.cmd.push(() => {
      googletag
        .defineSlot(adUnit.adUnitId, sizes, adUnit.adId)
        .addService(googletag.pubads())
    })
  })
  const keyValuePairs = Object.entries(pageLevelKeyValues)
  googletag.cmd.push(() => {
    keyValuePairs.forEach(([key, value]) =>
      googletag.pubads().setTargeting(key, value)
    )
    googletag.pubads().enableSingleRequest()
    googletag.enableServices()
  })
}
