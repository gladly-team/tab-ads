/* eslint-env jest */

describe('BidResponse', () => {
  it('constructs as expected', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      revenue: 0.081,
      encodedRevenue: 'abcxyz',
      DFPAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    const myBidResponse = BidResponse(input)
    expect(myBidResponse).toEqual(input)
  })

  it('throws if no revenue or encodedRevenue is provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      // revenue: 0.081,
      // encodedRevenue: 'abcxyz',
      DFPAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow(
      'A bid response must have either the "revenue" or "encodedRevenue" property.'
    )
  })

  it('throws if the revenue is a string instead of a number', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      revenue: '0.081',
      DFPAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "revenue" value must be a number.')
  })
})
