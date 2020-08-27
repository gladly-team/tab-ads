/* eslint-disable no-console */
/* eslint-env jest */

import logger from 'src/utils/logger'
import getUSPString from 'src/utils/getUSPString'

jest.mock('src/utils/logger')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  window.__uspapi = jest.fn((cmd, _, callback) => {
    switch (cmd) {
      case 'getUSPData': {
        callback({ version: '1', uspString: '1YNN' }, true)
        break
      }
      default:
        callback(null, false)
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getUSPString', () => {
  it('returns the expected value', async () => {
    expect.assertions(1)
    const uspStr = await getUSPString()
    expect(uspStr).toEqual('1YNN')
  })

  it('calls logger.debug on start', async () => {
    expect.assertions(1)
    await getUSPString({ timeout: 301 })
    expect(logger.debug).toHaveBeenCalledWith(
      `Fetching USP string with timeout 301ms.`
    )
  })

  it('calls logger.debug on success', async () => {
    expect.assertions(1)
    await getUSPString({ timeout: 301 })
    expect(logger.debug).toHaveBeenCalledWith(`Received USP data:`, {
      version: '1',
      uspString: '1YNN',
    })
  })

  it('returns the correct value if it does not time out', async () => {
    expect.assertions(1)
    window.__uspapi = jest.fn((cmd, _, callback) => {
      switch (cmd) {
        case 'getUSPData': {
          setTimeout(() => {
            callback({ version: '1', uspString: '1YYN' }, true)
          }, 790) // less than the timeout
          break
        }
        default:
          callback(null, false)
      }
    })
    const promise = getUSPString({ timeout: 800 })
    jest.runAllTimers()
    const uspStr = await promise
    expect(uspStr).toEqual('1YYN')
  })

  it('returns null if it times out', async () => {
    expect.assertions(1)
    window.__uspapi = jest.fn((cmd, _, callback) => {
      switch (cmd) {
        case 'getUSPData': {
          setTimeout(() => {
            callback({ version: '1', uspString: '1YYN' }, true)
          }, 900) // more than the timeout
          break
        }
        default:
          callback(null, false)
      }
    })
    const promise = getUSPString({ timeout: 800 })
    jest.runAllTimers()
    const uspStr = await promise
    expect(uspStr).toBeNull()
  })

  it('returns null if the CMP errors', async () => {
    expect.assertions(1)
    window.__uspapi = jest.fn((cmd, _, callback) => {
      switch (cmd) {
        case 'getUSPData': {
          callback({ version: '1', uspString: '1YYN' }, false) // false === errored
          break
        }
        default:
          callback(null, false)
      }
    })
    const uspStr = await getUSPString()
    expect(uspStr).toBeNull()
  })

  it('calls logger.debug when the CMP errors', async () => {
    expect.assertions(1)
    window.__uspapi = jest.fn((cmd, _, callback) => {
      switch (cmd) {
        case 'getUSPData': {
          callback({ version: '1', uspString: '1YYN' }, false) // false === errored
          break
        }
        default:
          callback(null, false)
      }
    })
    await getUSPString()
    expect(logger.debug).toHaveBeenCalledWith(
      `Failed to get USP data. The CMP errored.`
    )
  })

  it('returns null if window.__uspapi is not a function', async () => {
    expect.assertions(1)
    window.__uspapi = undefined
    const uspStr = await getUSPString()
    expect(uspStr).toBeNull()
  })

  it('logs an error if window.__uspapi is not a function', async () => {
    expect.assertions(1)
    window.__uspapi = undefined
    await getUSPString()
    expect(logger.error).toHaveBeenCalledWith(
      new TypeError('window.__uspapi is not a function')
    )
  })
})
