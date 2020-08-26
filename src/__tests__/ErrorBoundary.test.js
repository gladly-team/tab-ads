/* eslint-env jest */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import { render } from '@testing-library/react'

const getMockProps = () => ({
  children: <div>hi</div>,
  onError: jest.fn(),
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('ErrorBoundary', () => {
  it('returns its children', () => {
    expect.assertions(1)
    const children = <div data-testid="child">hey there</div>
    const ErrorBoundary = require('src/ErrorBoundary').default
    const mockProps = getMockProps()
    const { container, getByTestId } = render(
      <ErrorBoundary {...mockProps}>{children}</ErrorBoundary>
    )
    expect(container.firstChild).toBe(getByTestId('child'))
  })

  it('returns null if a child throws', () => {
    expect.assertions(1)

    // Suppress expected errors.
    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})

    const Throw = () => {
      throw new Error('Uh oh.')
    }
    const children = <Throw />
    const ErrorBoundary = require('src/ErrorBoundary').default
    const mockProps = getMockProps()
    const { container } = render(
      <ErrorBoundary {...mockProps}>{children}</ErrorBoundary>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('calls "onError" if a child throws', () => {
    expect.assertions(1)

    // Suppress expected errors.
    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})

    const mockErr = new Error('Uh oh.')
    const Throw = () => {
      throw mockErr
    }
    const children = <Throw />
    const ErrorBoundary = require('src/ErrorBoundary').default
    const mockProps = getMockProps()
    render(<ErrorBoundary {...mockProps}>{children}</ErrorBoundary>)
    expect(mockProps.onError).toHaveBeenCalledWith(mockErr)
  })
})
