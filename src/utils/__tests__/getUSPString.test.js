/* eslint-disable no-console */
/* eslint-env jest */

// import logger from 'src/utils/logger'
import getUSPString from 'src/utils/getUSPString'

jest.mock('src/utils/logger')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  window.__uspapi = jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getUSPString', () => {
  it('returns the expected value', async () => {
    expect.assertions(1)

    // TODO
    const uspStr = await getUSPString()
    expect(uspStr).toEqual('1YYN')
  })
})
