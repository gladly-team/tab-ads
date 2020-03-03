import React from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    const { onError } = this.props
    onError(error)
  }

  render() {
    const { hasError } = this.state
    if (hasError) {
      return null
    }
    const { children } = this.props
    return children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.element.isRequired,
  onError: PropTypes.func,
}

ErrorBoundary.defaultProps = {
  onError: () => {},
}

export default ErrorBoundary
