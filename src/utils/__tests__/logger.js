/* eslint-disable no-console */
/* eslint-env jest */

afterEach(() => {
  jest.clearAllMocks()
})

const formatMessage = msg => `tab-ads: ${msg}`

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
})
