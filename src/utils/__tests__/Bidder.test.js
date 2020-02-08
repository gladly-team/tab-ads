/* eslint-env jest */

describe('Bidder', () => {
  it('constructs as expected', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: 'myBidder',
      fetchBids: jest.fn(),
      setTargeting: jest.fn(),
    }
    const myBidder = Bidder(input)
    expect(myBidder).toEqual(input)
  })

  it('throws if no name is provided', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      // name: 'myBidder',
      fetchBids: jest.fn(),
      setTargeting: jest.fn(),
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The bidder must have a "name" property.')
  })

  it('throws if the name is not a string', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: () => {},
      fetchBids: jest.fn(),
      setTargeting: jest.fn(),
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The "name" property must be a string.')
  })

  it('throws if no fetchBids is provided', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: 'myBidder',
      // fetchBids: jest.fn(),
      setTargeting: jest.fn(),
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The bidder must have a "fetchBids" property.')
  })

  it('throws if fetchBids is not a function', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: 'myBidder',
      fetchBids: 'hi',
      setTargeting: jest.fn(),
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The "fetchBids" property must be a function.')
  })

  it('throws if no setTargeting is provided', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: 'myBidder',
      fetchBids: jest.fn(),
      // setTargeting: jest.fn(),
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The bidder must have a "setTargeting" property.')
  })

  it('throws if setTargeting is not a function', () => {
    const Bidder = require('src/utils/Bidder').default
    const input = {
      name: 'myBidder',
      fetchBids: jest.fn(),
      setTargeting: 'hey',
    }
    expect(() => {
      Bidder(input)
    }).toThrow('The "setTargeting" property must be a function.')
  })
})
