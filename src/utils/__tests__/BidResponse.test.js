/* eslint-env jest */

describe('BidResponse', () => {
  it('constructs as expected', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      encodedRevenue: 'abcxyz',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    const myBidResponse = BidResponse(input)
    expect(myBidResponse).toEqual(input)
  })

  it('throws if no adId is provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      // adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "adId" value must be provided.')
  })

  it('throws if the adId is not a string', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 123, // incorrect
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "adId" value must be a string.')
  })

  it('throws if no revenue or encodedRevenue is provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      // revenue: 0.081,
      // encodedRevenue: 'abcxyz',
      GAMAdvertiserId: 629518,
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
      adId: 'abc-123',
      revenue: '0.081',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "revenue" value must be a number.')
  })

  it('does not throw if the encodedRevenue is provided, but not revenue', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      encodedRevenue: 'abcdef',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).not.toThrow()
  })

  it('does not throw if the revenue is zero', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).not.toThrow()
  })

  it('does not throw if the GAMAdvertiserId is not provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      // GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).not.toThrow()
  })

  it('throws if the GAMAdvertiserId is a string', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: '629518',
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "GAMAdvertiserId" value must be a number.')
  })

  it('does not throw if the GAMAdvertiserId is zero', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 0,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).not.toThrow()
  })

  it('throws if the advertiserName is not provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      // advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "advertiserName" value must be provided.')
  })

  it('throws if the advertiserName is not a string', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 12,
      adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "advertiserName" value must be a string.')
  })

  it('throws if the adSize is not provided', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      // adSize: '300x250',
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "adSize" value must be provided.')
  })

  it('throws if the adSize is not a string', () => {
    const BidResponse = require('src/utils/BidResponse').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: 300,
    }
    expect(() => {
      BidResponse(input)
    }).toThrow('The "adSize" value must be a string.')
  })
})
