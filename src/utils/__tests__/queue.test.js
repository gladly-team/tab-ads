/* eslint-env jest */

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

describe('queue', () => {
  it('does not run commands until runQueue is set to true', () => {
    expect.assertions(6)
    const queue = require('src/utils/queue').default
    const mockCmdA = jest.fn()
    const mockCmdB = jest.fn()
    const mockCmdC = jest.fn()
    queue(() => {
      mockCmdA()
      mockCmdB()
    })
    queue(() => {
      mockCmdC()
    })
    expect(mockCmdA).not.toHaveBeenCalled()
    expect(mockCmdB).not.toHaveBeenCalled()
    expect(mockCmdC).not.toHaveBeenCalled()
    queue.runQueue(true)
    expect(mockCmdA).toHaveBeenCalled()
    expect(mockCmdB).toHaveBeenCalled()
    expect(mockCmdC).toHaveBeenCalled()
  })

  it('after runQueue is set to true, it immediately runs future commands', () => {
    expect.assertions(5)
    const queue = require('src/utils/queue').default
    const mockCmdA = jest.fn()
    const mockCmdB = jest.fn()
    const mockCmdC = jest.fn()
    queue.runQueue(true)
    queue(() => {
      mockCmdA()
    })
    expect(mockCmdA).toHaveBeenCalled()
    queue.runQueue(false)
    queue(() => {
      mockCmdB()
      mockCmdC()
    })
    expect(mockCmdB).not.toHaveBeenCalled()
    expect(mockCmdC).not.toHaveBeenCalled()
    queue.runQueue(true)
    expect(mockCmdB).toHaveBeenCalled()
    expect(mockCmdC).toHaveBeenCalled()
  })

  it('after runQueue is set to false, it queues future commands until it is set to true again', () => {
    expect.assertions(2)
    const queue = require('src/utils/queue').default
    const mockCmdA = jest.fn()
    const mockCmdB = jest.fn()
    queue.runQueue(true)
    queue(() => {
      mockCmdA()
    })
    expect(mockCmdA).toHaveBeenCalled()
    queue(() => {
      mockCmdB()
    })
    expect(mockCmdB).toHaveBeenCalled()
  })

  it('it does not re-run commands if runQueue is set to true more than once', () => {
    expect.assertions(2)
    const queue = require('src/utils/queue').default
    const mockCmdA = jest.fn()
    const mockCmdB = jest.fn()
    queue.runQueue(true)
    queue(() => {
      mockCmdA()
    })
    queue(() => {
      mockCmdB()
    })
    queue.runQueue(true)
    queue.runQueue(true)
    queue(() => {
      // some other command
    })
    expect(mockCmdA).toHaveBeenCalledTimes(1)
    expect(mockCmdB).toHaveBeenCalledTimes(1)
  })
})
