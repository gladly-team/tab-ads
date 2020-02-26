/* eslint no-console: 0 */

import queue from 'src/utils/queue'
import { getConfig } from 'src/config'

const logLevels = {}
logLevels.DEBUG = 'debug'
logLevels.INFO = 'info'
logLevels.LOG = 'log'
logLevels.WARN = 'warn'
logLevels.ERROR = 'error'
logLevels.NONE = 'none'

const logLevelsOrder = [
  logLevels.DEBUG,
  logLevels.INFO,
  logLevels.LOG,
  logLevels.WARN,
  logLevels.ERROR,
  logLevels.NONE, // don't log anything
]

export const shouldLog = (logLevel, globalLogLevel) =>
  logLevelsOrder.indexOf(logLevel) >= logLevelsOrder.indexOf(globalLogLevel)

const log = (msg, logLevel) => {
  queue(() => {
    const logLevelThreshold = getConfig().logLevel
    if (!shouldLog(logLevel, logLevelThreshold)) {
      return
    }
    const finalMsg = `tab-ads: ${msg}`
    switch (logLevel) {
      case logLevels.DEBUG:
        console.debug(finalMsg)
        break
      case logLevels.INFO:
        console.info(finalMsg)
        break
      case logLevels.LOG:
        console.log(finalMsg)
        break
      case logLevels.WARN:
        console.warn(finalMsg)
        break
      case logLevels.ERROR:
        console.error(finalMsg)
        break
      default:
        console.error(finalMsg)
    }
  })
}

const logger = {
  log: msg => {
    log(msg, logLevels.LOG)
  },
  debug: msg => {
    log(msg, logLevels.DEBUG)
  },
  info: msg => {
    log(msg, logLevels.INFO)
  },
  warn: msg => {
    log(msg, logLevels.WARN)
  },
  error: msg => {
    log(msg, logLevels.ERROR)
  },
}

export default logger
