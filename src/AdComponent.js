import React from 'react'
import PropTypes from 'prop-types'

// Suggestions on a React component using Google ads:
// https://stackoverflow.com/q/25435066/1332513
class Ad extends React.Component {
  componentDidMount() {
    // TODO: call to display ad
    // TODO: call callbacks when ad is displayed
  }

  // Never update. This prevents unexpected unmounting or
  // rerendering of third-party ad content.
  shouldComponentUpdate() {
    return false
  }

  render() {
    const { adId, style } = this.props
    return (
      <div style={style}>
        <div id={adId} data-testid="ad-container" />
      </div>
    )
  }
}

Ad.propTypes = {
  adId: PropTypes.string.isRequired,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
}

Ad.defaultProps = {
  style: {},
}

export default Ad
