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
    const { logLevel: logLevelThreshold, onError } = getConfig()
    if (!shouldLog(logLevel, logLevelThreshold)) {
      return
    }
    const prefix = [
      '%ctab-ads',
      'background: #4fb6ff; color: #fff; border-radius: 2px; padding: 2px 6px',
    ]
    switch (logLevel) {
      case logLevels.DEBUG:
        console.debug(...prefix, ...msg)
        break
      case logLevels.INFO:
        console.info(...prefix, ...msg)
        break
      case logLevels.LOG:
        console.log(...prefix, ...msg)
        break
      case logLevels.WARN:
        console.warn(...prefix, ...msg)
        break
      case logLevels.ERROR:
        onError(...msg)
        console.error(...prefix, ...msg)
        break
      default:
        console.error(...prefix, ...msg)
    }
  })
}

const logger = {
  log: (...args) => {
    log(args, logLevels.LOG)
  },
  debug: (...args) => {
    log(args, logLevels.DEBUG)
  },
  info: (...args) => {
    log(args, logLevels.INFO)
  },
  warn: (...args) => {
    log(args, logLevels.WARN)
  },
  error: (...args) => {
    log(args, logLevels.ERROR)
  },
}

export default logger
