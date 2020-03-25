import getGlobal from 'src/utils/getGlobal'

export default () => {
  const global = getGlobal()
  const googletag = global.googletag || {}
  googletag.cmd = googletag.cmd || []
  // We're not running in global scope, so make sure to
  // assign to the global.
  if (!global.googletag) {
    global.googletag = googletag
  }
  return googletag
}
