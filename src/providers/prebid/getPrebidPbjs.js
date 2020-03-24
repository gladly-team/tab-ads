import getGlobal from 'src/utils/getGlobal'

export default () => {
  const global = getGlobal()
  const pbjs = global.pbjs || {}
  // We're not running in global scope, so make sure to
  // assign to the global.
  if (!global.pbjs) {
    global.pbjs = pbjs
  }
  pbjs.que = pbjs.que || []
  return pbjs
}
