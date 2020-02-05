export default function(adId) {
  let mockNetworkDelayMs = 0
  const useMockDelay = false
  if (useMockDelay) {
    mockNetworkDelayMs = Math.random() * (1500 - 900) + 900
  }
  // FIXME: use the config to get the correct height
  // const mapDOMIdToHeight = {
  //   [VERTICAL_AD_SLOT_DOM_ID]: 250,
  //   [SECOND_VERTICAL_AD_SLOT_DOM_ID]: 250,
  //   [HORIZONTAL_AD_SLOT_DOM_ID]: 90,
  // }
  // const height = mapDOMIdToHeight[adId]
  const height = 250

  // Mock returning an ad.
  setTimeout(() => {
    const elem = document.getElementById(adId)
    if (!elem) {
      return
    }
    elem.setAttribute(
      'style',
      `
      color: white;
      background: repeating-linear-gradient(
        -55deg,
        #222,
        #222 20px,
        #333 20px,
        #333 40px
      );
      width: 100%;
      height: ${height}px;
    `
    )
  }, mockNetworkDelayMs)
}
