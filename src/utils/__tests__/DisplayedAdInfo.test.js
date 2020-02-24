/* eslint-env jest */

describe('DisplayedAdInfo', () => {
  it('constructs as expected', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      encodedRevenue: 'abcxyz',
      GAMAdvertiserId: 629518,
      adSize: '300x250',
    }
    const myDisplayedAdInfo = DisplayedAdInfo(input)
    expect(myDisplayedAdInfo).toEqual(input)
  })

  it('throws if no adId is provided', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      // adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "adId" value must be provided.')
  })

  it('throws if the adId is not a string', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 123, // incorrect
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "adId" value must be a string.')
  })

  it('throws if no revenue or encodedRevenue is provided', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      // revenue: 0.081,
      // encodedRevenue: 'abcxyz',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow(
      'A bid response must have either the "revenue" or "encodedRevenue" property.'
    )
  })

  it('throws if the revenue is a string instead of a number', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: '0.081',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "revenue" value must be a number.')
  })

  it('does not throw if the encodedRevenue is provided, but not revenue', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      encodedRevenue: 'abcdef',
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).not.toThrow()
  })

  it('does not throw if the revenue is zero', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).not.toThrow()
  })

  it('throws if the GAMAdvertiserId is not provided', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      // GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "GAMAdvertiserId" value must be provided.')
  })

  it('throws if the GAMAdvertiserId is a string', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: '629518',
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "GAMAdvertiserId" value must be a number.')
  })

  it('does not throw if the GAMAdvertiserId is zero', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 0,
      advertiserName: 'SomeAdvertiser',
      adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).not.toThrow()
  })

  it('throws if the adSize is not provided', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      // adSize: '300x250',
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "adSize" value must be provided.')
  })

  it('throws if the adSize is not a string', () => {
    const DisplayedAdInfo = require('src/utils/DisplayedAdInfo').default
    const input = {
      adId: 'abc-123',
      revenue: 0.081,
      GAMAdvertiserId: 629518,
      advertiserName: 'SomeAdvertiser',
      adSize: 300,
    }
    expect(() => {
      DisplayedAdInfo(input)
    }).toThrow('The "adSize" value must be a string.')
  })
})
