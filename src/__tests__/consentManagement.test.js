/* eslint-env jest */

beforeEach(() => {
  // Mock CMP
  window.__cmp = jest.fn(command => {
    // Documenting available commands for Quantcast CMP.
    // https://quantcast.zendesk.com/hc/en-us/articles/360003814853-Technical-Implementation-Guide
    // IAB standard docs:
    // https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/CMP%20JS%20API%20v1.1%20Final.md#what-api-will-need-to-be-provided-by-the-cmp-
    switch (command) {
      case 'displayConsentUi':
        break
      case 'getConfig':
        break
      case 'getCurrentVendorConsents':
        break
      case 'getConsentData':
        break
      case 'getPublisherConsents':
        break
      case 'getCurrentPublisherConsents':
        break
      case 'getVendorConsents':
        break
      case 'getVendorList':
        break
      case 'init':
        break
      case 'initConfig':
        break
      case 'runConsentUiCallback':
        break
      case 'saveConsents':
        break
      case 'setConsentUiCallback':
        break
      default:
        throw new Error('Invalid CMP command')
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

afterAll(() => {
  delete window.__cmp
})

describe('consentManagement', () => {
  it('calls the CMP as expected to get the consent string', async () => {
    // Mock the CMP callback for getting consent data
    window.__cmp.mockImplementation((command, version, callback) => {
      if (command === 'getConsentData') {
        callback({
          consentData: 'abcdefghijklm', // consent string
          gdprApplies: true,
          hasGlobalConsent: false,
        })
      }
    })
    const { getConsentString } = require('src/consentManagement')
    const consentString = await getConsentString()
    expect(consentString).toEqual('abcdefghijklm')
  })

  it('returns null if the CMP throws an error while getting the consent string', async () => {
    window.__cmp.mockImplementation(() => {
      throw new Error('CMP made a mistake!')
    })

    // Mute expected console error
    jest.spyOn(console, 'error').mockImplementationOnce(() => {})

    const { getConsentString } = require('src/consentManagement')
    const consentString = await getConsentString()
    expect(consentString).toBeNull()
  })

  it('calls to display CMP UI as expected', () => {
    const { displayConsentUI } = require('src/consentManagement')
    displayConsentUI()
    expect(window.__cmp).toHaveBeenCalledWith('displayConsentUi')
  })

  it('calls the CMP as expected to get "hasGlobalConsent"', async () => {
    expect.assertions(1)

    // Mock the CMP callback for getting consent data
    window.__cmp.mockImplementation((command, version, callback) => {
      if (command === 'getConsentData') {
        callback({
          consentData: 'abcdefghijklm', // consent string
          gdprApplies: true,
          hasGlobalConsent: false,
        })
      }
    })
    const { hasGlobalConsent } = require('src/consentManagement')
    const isGlobalConsent = await hasGlobalConsent()
    expect(isGlobalConsent).toBe(false)
  })

  it('returns null if the CMP throws an error while getting "hasGlobalConsent"', async () => {
    expect.assertions(1)

    window.__cmp.mockImplementation(() => {
      throw new Error('CMP made a mistake!')
    })

    // Mute expected console error
    jest.spyOn(console, 'error').mockImplementationOnce(() => {})

    const { hasGlobalConsent } = require('src/consentManagement')
    const isGlobalConsent = await hasGlobalConsent()
    expect(isGlobalConsent).toBeNull()
  })

  it('registers a callback as expected', async () => {
    expect.assertions(2)

    // Mock the CMP callback for getting consent data
    let mockCMPConsentChange
    window.__cmp.mockImplementation(
      (command, callback, getConsentDataCallback) => {
        if (command === 'setConsentUiCallback') {
          mockCMPConsentChange = callback
        }
        if (command === 'getConsentData') {
          getConsentDataCallback({
            consentData: 'abcdefghijklm',
            gdprApplies: true,
            hasGlobalConsent: false,
          })
        }
      }
    )
    const { registerConsentCallback } = require('src/consentManagement')
    const mockCallback = jest.fn()
    registerConsentCallback(mockCallback)

    // Mock that the CMP calls its callback on consent change
    await mockCMPConsentChange()

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('abcdefghijklm', false)
  })

  it('registers multiple callbacks as expected', async () => {
    expect.assertions(3)

    // Mock the CMP callback for getting consent data
    let mockCMPConsentChange
    window.__cmp.mockImplementation(
      (command, callback, getConsentDataCallback) => {
        if (command === 'setConsentUiCallback') {
          mockCMPConsentChange = callback
        }
        if (command === 'getConsentData') {
          getConsentDataCallback({
            consentData: 'abcdefghijklm',
            gdprApplies: true,
            hasGlobalConsent: false,
          })
        }
      }
    )
    const { registerConsentCallback } = require('src/consentManagement')
    const mockCallbackA = jest.fn()
    registerConsentCallback(mockCallbackA)
    const mockCallbackB = jest.fn()
    registerConsentCallback(mockCallbackB)
    const mockCallbackC = jest.fn()
    registerConsentCallback(mockCallbackC)

    // Mock that the CMP calls its callback on consent change
    await mockCMPConsentChange()

    expect(mockCallbackA).toHaveBeenCalledTimes(1)
    expect(mockCallbackB).toHaveBeenCalledTimes(1)
    expect(mockCallbackC).toHaveBeenCalledTimes(1)
  })

  it('unregisters callbacks as expected', async () => {
    expect.assertions(6)

    // Mock the CMP callback for getting consent data
    let mockCMPConsentChange
    window.__cmp.mockImplementation(
      (command, callback, getConsentDataCallback) => {
        if (command === 'setConsentUiCallback') {
          mockCMPConsentChange = callback
        }
        if (command === 'getConsentData') {
          getConsentDataCallback({
            consentData: 'abcdefghijklm',
            gdprApplies: true,
            hasGlobalConsent: false,
          })
        }
      }
    )

    // Register some callbacks.
    const { registerConsentCallback } = require('src/consentManagement')
    const mockCallbackA = jest.fn()
    registerConsentCallback(mockCallbackA)
    const mockCallbackB = jest.fn()
    registerConsentCallback(mockCallbackB)
    const mockCallbackC = jest.fn()
    registerConsentCallback(mockCallbackC)

    // Mock that the CMP calls its callback on consent change
    await mockCMPConsentChange()
    expect(mockCallbackA).toHaveBeenCalledTimes(1)
    expect(mockCallbackB).toHaveBeenCalledTimes(1)
    expect(mockCallbackC).toHaveBeenCalledTimes(1)

    // Unregister some callbacks.
    const { unregisterConsentCallback } = require('src/consentManagement')
    unregisterConsentCallback(mockCallbackA)
    unregisterConsentCallback(mockCallbackC)

    // Mock that the CMP calls its callback on consent change
    await mockCMPConsentChange()

    // It should not have called the unregistered callbacks,
    // but it should have still called the registered one.
    expect(mockCallbackA).toHaveBeenCalledTimes(1)
    expect(mockCallbackB).toHaveBeenCalledTimes(2)
    expect(mockCallbackC).toHaveBeenCalledTimes(1)
  })
})
