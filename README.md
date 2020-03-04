[![Build Status](https://travis-ci.org/gladly-team/tab-ads.svg?branch=master)](https://travis-ci.org/gladly-team/tab-ads)
[![codecov](https://codecov.io/gh/gladly-team/tab-ads/branch/master/graph/badge.svg)](https://codecov.io/gh/gladly-team/tab-ads)
[![npm](https://img.shields.io/npm/v/tab-ads.svg)](https://www.npmjs.com/package/tab-ads)
# tab-ads
An NPM package to manage ads logic for [Tab for a Cause](https://github.com/gladly-team/tab)

## Overview
The goal of this module is to move ads-specific Tab for a Cause logic out of the app code. It is responsible for:
- defining the ad units that are available to show on Tab for a Cause
- managing each bidder partner's configuration
- calling for bids, ending the auction, fetching ads from the ad server, and displaying them
- providing information on the winning ad for each ad slot

Some of the motivation for this module is to handle bidder partners that are not part of the [Prebid](https://github.com/prebid/Prebid.js) ecosystem or need to run outside Prebid. (In a way, it's like a mini Prebid in which Prebid is one of the bidder partners.)

## API

`fetchAds(config)`: fetch ads for specified ad units. See [config.js](https://github.com/gladly-team/tab-ads/blob/master/src/config.js#L10-L52) for config options.

`AdComponent`: returns a React [`AdComponent`](https://github.com/gladly-team/tab-ads/blob/master/src/AdComponent.js), which handles ad display.

`getAvailableAdUnits`: returns an object of available ad units (`leaderboard`, `rectangleAdPrimary`, and `rectangleAdSecondary`). See [getAvailableAdUnits.js](https://github.com/gladly-team/tab-ads/blob/master/src/getAvailableAdUnits.js).

In addition, the module sets `window.tabAds` with two properties useful for debugging:
- `getAllWinningBids`: a function that returns information on the winning ad for each ad slot
- `adDataStore`: storage of each bidder partner's raw and formatted bid responses, as well as Google Ad Manager's slot events

## HTML Tags
We must include the following scripts immediately after the `<body>` tag and before calling `tab-ads`:
```
<!--
  Google Publisher Tag
-->
<script type="text/javascript">/* eslint-disable */
  // Google Tag Manager
  var googletag = window.googletag || {}
  googletag.cmd = googletag.cmd || []
  googletag.cmd.push(() => {
    googletag.pubads().disableInitialLoad()
    googletag.pubads().setTagForChildDirectedTreatment(0)
  })

  var gads = document.createElement('script')
  gads.async = true
  gads.type = 'text/javascript'
  var useSSL = document.location.protocol === 'https:'
  gads.src = (useSSL ? 'https:' : 'http:') +
    '//www.googletagservices.com/tag/js/gpt.js'
  var head = document.getElementsByTagName('head')[0]
  head.appendChild(gads)
</script>
<% } %>

<!--
  Amazon apstag
-->
<script>/* eslint-disable */
try {
  !function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");
} catch(e) {
  console.error(e)
}
</script>

<!--
  Index Exchange. See:
  https://kb.indexexchange.com/Wrapper/Installation/Universal_Library_Implementation.htm
-->
<script async src="//js-sec.indexww.com/ht/p/189508-208262485043658.js"></script>
```

We could consider adding a `getAdCodeForHTMLBody()` function to `tab-ads`, which apps could use to insert scripts into the page.
