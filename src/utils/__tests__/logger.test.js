/* eslint-disable no-console */
/* eslint-env jest */

import { setConfig } from 'src/config'

afterEach(() => {
  jest.clearAllMocks()
})

const formatMessage = msg => `tab-ads: ${msg}`

beforeEach(() => {
  // Reset the config each time. By default, use logLevl === "debug".
  setConfig({
    logLevel: 'debug',
  })
})

describe('logger', () => {
  it('contains expected methods', () => {
    const loggerMethods = ['log', 'debug', 'info', 'warn', 'error']
    const logger = require('src/utils/logger').default
    loggerMethods.forEach(method => {
      expect(logger[method]).not.toBeUndefined()
    })
  })

  test('logger.log logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.log(theMsg)
    expect(console.log).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.debug logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'debug').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.debug(theMsg)
    expect(console.debug).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.info logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'info').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.info(theMsg)
    expect(console.info).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.warn logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.warn(theMsg)
    expect(console.warn).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.error logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.debug does not log to console when the logLevel is "info"', () => {
    setConfig({
      logLevel: 'info',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.debug(theMsg)
    expect(console.debug).not.toHaveBeenCalled()
  })

  test('logger.warn does not log to console when the logLevel is "error"', () => {
    setConfig({
      logLevel: 'error',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.warn(theMsg)
    expect(console.warn).not.toHaveBeenCalled()
  })

  test('logger.error logs to console when the logLevel is "error"', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    setConfig({
      logLevel: 'error',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).toHaveBeenCalledWith(formatMessage(theMsg))
  })

  test('logger.error does not log to console when the logLevel is "none"', () => {
    setConfig({
      logLevel: 'none',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).not.toHaveBeenCalled()
  })
})
