/* eslint no-console: 0 */

const LOG_LEVEL = 'debug' // TODO: set this in the config

const logLevels = {}
logLevels.LOG = 'log'
logLevels.DEBUG = 'debug'
logLevels.INFO = 'info'
logLevels.WARN = 'warn'
logLevels.ERROR = 'error'
logLevels.FATAL = 'fatal'

const logLevelsOrder = [
  logLevels.DEBUG,
  logLevels.LOG,
  logLevels.INFO,
  logLevels.WARN,
  logLevels.ERROR,
  logLevels.FATAL,
]

export const shouldLog = (logLevel, globalLogLevel) =>
  logLevelsOrder.indexOf(logLevel) >= logLevelsOrder.indexOf(globalLogLevel)

const log = (msg, logLevel) => {
  if (!shouldLog(logLevel, LOG_LEVEL)) {
    return
  }
  const finalMsg = `tab-ads: ${msg}`
  switch (logLevel) {
    case logLevels.DEBUG:
      console.debug(finalMsg)
      break
    case logLevels.LOG:
      console.log(finalMsg)
      break
    case logLevels.INFO:
      console.info(finalMsg)
      break
    case logLevels.WARN:
      console.warn(finalMsg)
      break
    case logLevels.ERROR:
      console.error(finalMsg)
      break
    case logLevels.FATAL:
      console.error(finalMsg)
      break
    default:
      console.error(finalMsg)
  }
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
  fatal: msg => {
    log(msg, logLevels.FATAL)
  },
}

export default logger
