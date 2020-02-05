import getGoogleTag from 'src/google/getGoogleTag'

// TODO: assumes we are showing all 3 ads. Make that configurable.
export default config => {
  const {
    leaderboard,
    rectangleAdPrimary,
    rectangleAdSecondary,
  } = config.newTabAds
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    // Leaderboard
    googletag
      .defineSlot(leaderboard.adUnitId, leaderboard.sizes, leaderboard.adId)
      .addService(googletag.pubads())
    // Rectangle #1
    googletag
      .defineSlot(
        rectangleAdPrimary.adUnitId,
        rectangleAdPrimary.sizes,
        rectangleAdPrimary.adId
      )
      .addService(googletag.pubads())
    // Rectangle #2
    googletag
      .defineSlot(
        rectangleAdSecondary.adUnitId,
        rectangleAdSecondary.sizes,
        rectangleAdSecondary.adId
      )
      .addService(googletag.pubads())
    googletag.pubads().enableSingleRequest()
    googletag.enableServices()
  })
}
