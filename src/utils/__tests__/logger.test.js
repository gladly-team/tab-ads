/* eslint-disable no-console */
/* eslint-env jest */

import { getMockTabAdsUserConfig } from 'src/utils/test-utils'

afterEach(() => {
  jest.clearAllMocks()
})

const messagePrefix = [
  '%ctab-ads',
  'background: #4fb6ff; color: #fff; border-radius: 2px; padding: 2px 6px',
]
const onErrorHandler = jest.fn()

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()

  const { setConfig } = require('src/config')
  // Reset the config each time. By default, use logLevel === "debug".
  setConfig({
    ...getMockTabAdsUserConfig(),
    logLevel: 'debug',
    onError: onErrorHandler,
  })
})

describe('logger', () => {
  it('contains expected methods', () => {
    const loggerMethods = ['log', 'debug', 'info', 'warn', 'error']
    const logger = require('src/utils/logger').default
    loggerMethods.forEach((method) => {
      expect(logger[method]).not.toBeUndefined()
    })
  })

  test('logger.log logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.log(theMsg)
    expect(console.log).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.debug logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'debug').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.debug(theMsg)
    expect(console.debug).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.info logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'info').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.info(theMsg)
    expect(console.info).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.warn logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.warn(theMsg)
    expect(console.warn).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.error logs to console', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.error calls config.onError with the original message', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(onErrorHandler).toHaveBeenCalledWith(theMsg)
  })

  test('logger.debug does not log to console when the logLevel is "info"', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'info',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.debug(theMsg)
    expect(console.debug).not.toHaveBeenCalled()
  })

  test('logger.warn does not log to console when the logLevel is "error"', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'error',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.warn(theMsg)
    expect(console.warn).not.toHaveBeenCalled()
  })

  test('logger.log logs to console when the logLevel is "info"', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())

    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'info',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.log(theMsg)
    expect(console.log).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.error logs to console when the logLevel is "error"', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'error',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })

  test('logger.error calls config.onError with the original message when the logLevel is "error"', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'error',
      onError: onErrorHandler,
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(onErrorHandler).toHaveBeenCalledWith(theMsg)
  })

  test('logger.error does not log to console when the logLevel is "none"', () => {
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'none',
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(console.error).not.toHaveBeenCalled()
  })

  test('logger.error does not call config.onError when the logLevel is "none"', () => {
    // Suppress expected console message.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn())

    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'none',
      onError: onErrorHandler,
    })

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.error(theMsg)
    expect(onErrorHandler).not.toHaveBeenCalled()
  })

  test('it queues logging until the config has been set', () => {
    // Make sure the config is unset.
    jest.resetModules()

    // Suppress expected console message.
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())

    const logger = require('src/utils/logger').default
    const theMsg = 'A thing happened, FYI'
    logger.log(theMsg)

    // We will not log until the queue runs.
    expect(console.log).not.toHaveBeenCalled()

    // Setting the config will run the queue.
    const { setConfig } = require('src/config')
    setConfig({
      ...getMockTabAdsUserConfig(),
      logLevel: 'debug',
    })
    expect(console.log).toHaveBeenCalledWith(...messagePrefix, theMsg)
  })
})
