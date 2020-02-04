/* eslint no-console: 0 */

const logger = {
  log: msg => {
    console.log(msg)
  },
  debug: msg => {
    console.debug(msg)
  },
  info: msg => {
    console.info(msg)
  },
  warn: msg => {
    console.warn(msg)
  },
  error: msg => {
    console.error(msg)
  },
  fatal: msg => {
    console.fatal(msg)
  },
}

export default logger
