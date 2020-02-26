/* eslint-env jest */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import { render } from '@testing-library/react'

// https://github.com/testing-library/jest-dom#table-of-contents
import '@testing-library/jest-dom/extend-expect'

const getMockProps = () => ({
  adId: 'my-wonderful-ad-id',
  style: undefined,
})

describe('Ad component', () => {
  it('renders a child with a div ID equal to the adId prop', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const mockProps = getMockProps()
    const { getByTestId } = render(<AdComponent {...mockProps} />)
    expect(getByTestId('ad-container')).toHaveAttribute('id', mockProps.adId)
  })

  it('sets the style on the root element', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const mockProps = {
      ...getMockProps(),
      style: {
        display: 'inline',
        backgroundColor: 'green',
      },
    }
    const { container } = render(<AdComponent {...mockProps} />)
    expect(container.firstChild).toHaveStyle(mockProps.style)
  })
})
