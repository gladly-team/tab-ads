import getGoogleTag from 'src/google/getGoogleTag'

export default function(adId) {
  const googletag = getGoogleTag()
  googletag.cmd.push(() => {
    googletag.display(adId)
  })
}
