/* eslint-env jest */

import moment from 'moment'
import MockDate from 'mockdate'
import {
  getBrowserExtensionInstallTime,
  hasUserDismissedAdExplanation,
} from 'src/utils/local-user-data-mgr'

jest.mock('js/utils/experiments')
jest.mock('js/utils/local-user-data-mgr')

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

  test('[recently-installed] shows 1 ad', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(23, 'hours')
    )
    const { getNumberOfAdsToShow } = require('src/adSettings')
    expect(getNumberOfAdsToShow()).toEqual(1)
  })

  test('[unknown-recently-installed] shows 3 ads when the install time is missing', () => {
    getBrowserExtensionInstallTime.mockReturnValue(null)
    const { getNumberOfAdsToShow } = require('src/adSettings')
    expect(getNumberOfAdsToShow()).toEqual(3)
  })

  test('[no-recently-installed] shouldShowOneAd returns false', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(10, 'days')
    )
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(false)
  })

  test('[no-recently-installed] shouldShowAdExplanation returns false', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(10, 'days')
    )
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(false)
  })

  test('[unknown-recently-installed] shouldShowAdExplanation returns false', () => {
    getBrowserExtensionInstallTime.mockReturnValue(null)
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(false)
  })

  test('[recently-installed] shouldShowAdExplanation returns true', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(12, 'seconds')
    )
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(true)
  })

  test('[recently-installed] [no-dismissed] shouldShowAdExplanation returns true', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(12, 'seconds')
    )
    hasUserDismissedAdExplanation.mockReturnValue(false)
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(true)
  })

  test('[recently-installed] [dismissed] shouldShowAdExplanation returns false', () => {
    getBrowserExtensionInstallTime.mockReturnValue(
      moment(mockNow).subtract(12, 'seconds')
    )
    hasUserDismissedAdExplanation.mockReturnValue(true)
    const { shouldShowAdExplanation } = require('src/adSettings')
    expect(shouldShowAdExplanation()).toEqual(false)
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
