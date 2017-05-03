import React from 'react';
import { browserHistory, IndexRoute, IndexRedirect, Redirect, Route, Router } from 'react-router';

import App from './components/app';
import PolicyContainerResolver from './components/policies/container';
import RequirementsContainerResolver from './components/requirements/container';
import LookupSearchResolver, { redirectIfMatched } from './components/lookup-search';

// Trigger DAP pageviews when our history changes (for single-page-app users)
if (browserHistory && typeof gas !== 'undefined') {
  browserHistory.listen((loc) => {
    // Provided by DAP
    /* eslint-disable no-undef */
    gas('send', 'pageview', `${loc.pathname}${loc.search}`);
    /* eslint-enable no-undef */
  });
}

export default <Router history={browserHistory} >
  <Route path="/" component={App}>
    <IndexRedirect to="/requirements" />
    <Route path="search-redirect">
      <Route path="topics" component={LookupSearchResolver} onEnter={redirectIfMatched} />
      <Route path="policies" component={LookupSearchResolver} onEnter={redirectIfMatched} />
    </Route>
    <Route path="policies" component={PolicyContainerResolver} />
    <Route path="requirements">
      <IndexRoute component={RequirementsContainerResolver} />
      <Redirect from="by-topic" to="/requirements" />
      <Redirect from="by-policy" to="/requirements" />
    </Route>
  </Route>
</Router>;
