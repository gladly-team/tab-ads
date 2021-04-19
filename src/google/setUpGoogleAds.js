import getGoogleTag from 'src/google/getGoogleTag'

export default (config) => {
  const { adUnits, pageLevelKeyValueArray = [] } = config
  if (!adUnits.length) {
    return
  }
  const googletag = getGoogleTag()

  // Set up each ad unit.
  adUnits.forEach((adUnit) => {
    googletag.cmd.push(() => {
      googletag
        .defineSlot(adUnit.adUnitId, adUnit.sizes, adUnit.adId)
        .addService(googletag.pubads())
    })
  })

  googletag.cmd.push(() => {
    pageLevelKeyValueArray.forEach(([key, value]) =>
      googletag.pubads().setTargeting(key, value)
    )
    googletag.pubads().enableSingleRequest()
    googletag.enableServices()
  })
}
