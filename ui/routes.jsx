import React from 'react';
import { browserHistory, IndexRedirect, IndexRoute, Redirect, Route, Router } from 'react-router';

import App from './components/app';
import Topics from './components/topics';
import Index from './components/index';
import Container from './components/container';
import ReqsByTopic from './components/requirements/by-topic';
import Policy from './components/policies/policies';
import AsyncLookupSearch, { redirectIfMatched } from './components/lookup-search';

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
    <IndexRoute component={Index} />
    <Redirect from="keywords" to="topics" />
    <Route path="topics">
      <IndexRoute component={Topics} />
      <Route path="search-redirect" component={AsyncLookupSearch} onEnter={redirectIfMatched} />
    </Route>
    <Route path="policies" component={Container} tabName="Policy" search="policyList">
      <IndexRoute component={Policy} />
      <Route path="search-redirect" component={AsyncLookupSearch} onEnter={redirectIfMatched} />
    </Route>
    <Route path="requirements" component={Container} >
      <IndexRedirect to="/requirements/by-topic" />
      <Redirect from="by-keywords" to="by-topic" />
      <Route path="by-topic" tabName="Requirement" component={ReqsByTopic} />
    </Route>
  </Route>
</Router>;
