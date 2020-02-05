/* eslint-env jest */

const configMock = jest.genMockFromModule('src/config')
const configActual = require.requireActual('src/config')

module.exports = {
  ...configMock,
  // Use the actual config creation by default.
  createConfig: jest.fn(args => configActual.createConfig(args)),
}
