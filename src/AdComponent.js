import React from 'react'
import PropTypes from 'prop-types'
import displayAd from 'src/displayAd'
import { onAdRendered } from 'src/adDisplayListeners'

// Suggestions on a React component using Google ads:
// https://stackoverflow.com/q/25435066/1332513
class Ad extends React.Component {
  componentDidMount() {
    const { adId } = this.props

    // Display the ad as soon as it's available.
    displayAd(adId)

    // On ad display, call the onAdDisplayed callback.
    onAdRendered(adId, this.onAdDisplayedHandler.bind(this))
  }

  // Never update. This prevents unexpected unmounting or
  // rerendering of third-party ad content.
  shouldComponentUpdate() {
    return false
  }

  onAdDisplayedHandler(bidResponse) {
    const { onAdDisplayed } = this.props
    onAdDisplayed(bidResponse)
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
  onAdDisplayed: PropTypes.func,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
}

Ad.defaultProps = {
  onAdDisplayed: () => {},
  style: {},
}

export default Ad
