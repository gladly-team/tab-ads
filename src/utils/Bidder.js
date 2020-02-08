// Create a bidder object. A bidder is an ad provider that
// fetches bids to fill ad slots.
const Bidder = ({ name, fetchBids, setTargeting }) => {
  if (!name) {
    throw new Error('The bidder must have a "name" property.')
  }
  if (typeof name !== 'string') {
    throw new Error('The "name" property must be a string.')
  }
  if (!fetchBids) {
    throw new Error('The bidder must have a "fetchBids" property.')
  }
  if (typeof fetchBids !== 'function') {
    throw new Error('The "fetchBids" property must be a function.')
  }
  if (!setTargeting) {
    throw new Error('The bidder must have a "setTargeting" property.')
  }
  if (typeof setTargeting !== 'function') {
    throw new Error('The "setTargeting" property must be a function.')
  }
  return {
    name,
    fetchBids,
    setTargeting,
  }
}

export default Bidder
