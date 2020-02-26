/* eslint-env jest */

import React from 'react'
import { render } from '@testing-library/react'

// https://github.com/testing-library/jest-dom#table-of-contents
import '@testing-library/jest-dom/extend-expect'

describe('Ad component', () => {
  it('renders a child with a div ID equal to the adId prop', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const adId = 'my-ad-id'
    const { getByTestId } = render(<AdComponent adId={adId} />)
    expect(getByTestId('ad-container')).toHaveAttribute('id', adId)
  })
})
