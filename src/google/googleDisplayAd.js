import getGoogleTag from 'src/google/getGoogleTag'

const googleDisplayAd = (adId) => {
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    googletag.display(adId)
  })
}

export default googleDisplayAd
