// Expects we've set up Index Exchange's JS.
import getGlobal from 'src/utils/getGlobal'

export default () => {
  const global = getGlobal()
  const headertag = global.headertag || {}
  headertag.cmd = headertag.cmd || []
  // We're not running in global scope, so make sure to
  // assign to the global.
  if (!global.headertag) {
    global.headertag = headertag
  }
  return global.headertag
}
