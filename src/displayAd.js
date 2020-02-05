import googleDisplayAd from 'src/google/googleDisplayAd'
// import mockDisplayAd from 'src/mockDisplayAd'

export default adId => {
  // FIXME: depending on the config, don't show ads or show mock ads.
  googleDisplayAd(adId)
  // mockDisplayAd(adId)
}
