// Expects we've set up Amazon's apstag JS before this.
import getGlobal from 'src/utils/getGlobal'

export default () => {
  const global = getGlobal()
  return global.apstag
}
