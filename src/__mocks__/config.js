/* eslint-env jest */

const configMock = jest.genMockFromModule('src/config')
const configActual = jest.requireActual('src/config')

module.exports = {
  ...configMock,
  // Use the actual config creation by default.
  setConfig: jest.fn((args) => configActual.setConfig(args)),
}
