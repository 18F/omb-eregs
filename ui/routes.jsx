import React from 'react';
import { browserHistory, IndexRoute, Redirect, Route, Router } from 'react-router';

import App from './components/app';
import PrivacyView from './components/privacy-view';
import PolicyContainerResolver from './components/policies/container';
import RequirementsContainerResolver from './components/requirements/container';
import LookupSearchResolver from './components/lookup-search';
import Homepage from './components/homepage/view';

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
    <IndexRoute component={Homepage} />
    <Route path="privacy" component={PrivacyView} />
    <Route path="search-redirect">
      <Route path="agencies" component={LookupSearchResolver} />
      <Route path="policies" component={LookupSearchResolver} />
      <Route path="topics" component={LookupSearchResolver} />
    </Route>
    <Route path="policies" component={PolicyContainerResolver} />
    <Route path="requirements">
      <IndexRoute component={RequirementsContainerResolver} />
      <Redirect from="by-topic" to="/requirements" />
      <Redirect from="by-policy" to="/requirements" />
    </Route>
  </Route>
</Router>;
