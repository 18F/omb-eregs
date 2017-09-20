import React from 'react';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';

import App from './components/app';
import Homepage from './pages/index';
import PolicyContainerResolver from './pages/policies';
import Privacy from './pages/privacy';
import RequirementsContainerResolver from './pages/requirements';
import LookupSearchResolver from './pages/search-redirect';

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
    <Route path="privacy" component={Privacy} />
    <Route path="search-redirect">
      <Route path="agencies" component={LookupSearchResolver} />
      <Route path="policies" component={LookupSearchResolver} />
      <Route path="topics" component={LookupSearchResolver} />
    </Route>
    <Route path="policies" component={PolicyContainerResolver} />
    <Route path="requirements" component={RequirementsContainerResolver} />
  </Route>
</Router>;
