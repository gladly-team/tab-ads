/* eslint-env jest */
import { fetchAds } from 'src/index'

describe('fetchAds', () => {
  it('calls console.log twice', async () => {
    expect.assertions(1)
    const mockConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {})
    await fetchAds({ some: 'config' })
    expect(mockConsoleLog).toHaveBeenCalledTimes(2)
  })
})
