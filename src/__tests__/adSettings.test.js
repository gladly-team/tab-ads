/* eslint-env jest */

import moment from 'moment'
import MockDate from 'mockdate'

jest.mock('js/utils/experiments')

const mockNow = '2017-05-19T13:59:58.000Z'

beforeEach(() => {
  MockDate.set(moment(mockNow))
})

afterEach(() => {
  MockDate.reset()
})

describe('ad settings', () => {
  test('ad IDs and ad slot IDs are as expected', () => {
    // Important: do not change these IDs without consulting the
    // ad ops team.
    const {
      VERTICAL_AD_UNIT_ID,
      VERTICAL_AD_SLOT_DOM_ID,
      HORIZONTAL_AD_UNIT_ID,
      HORIZONTAL_AD_SLOT_DOM_ID,
    } = require('src/adSettings')
    expect(VERTICAL_AD_UNIT_ID).toBe('/43865596/HBTR')
    expect(VERTICAL_AD_SLOT_DOM_ID).toBe('div-gpt-ad-1464385742501-0')
    expect(HORIZONTAL_AD_UNIT_ID).toBe('/43865596/HBTL')
    expect(HORIZONTAL_AD_SLOT_DOM_ID).toBe('div-gpt-ad-1464385677836-0')
  })

  test('shows 3 ads', () => {
    const { getNumberOfAdsToShow } = require('src/adSettings')
    expect(getNumberOfAdsToShow()).toEqual(3)
  })

  test('getVerticalAdSizes returns the expected ad sizes', () => {
    const { getVerticalAdSizes } = require('src/adSettings')
    expect(getVerticalAdSizes()).toEqual([[300, 250]])
  })

  test('getHorizontalAdSizes returns the expected ad sizes', () => {
    const { getHorizontalAdSizes } = require('src/adSettings')
    expect(getHorizontalAdSizes()).toEqual([[728, 90]])
  })
})
