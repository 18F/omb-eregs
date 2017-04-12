import React from 'react';
import { browserHistory, IndexRedirect, IndexRoute, Route, Router } from 'react-router';

import App from './components/app';
import Keywords from './components/keywords';
import Index from './components/index';
import Policies from './components/policies';
import Requirements from './components/requirements/container';
import ReqsByKeyword from './components/requirements/by-keyword';
import ReqsByPolicy from './components/requirements/by-policy';
import AsyncLookupSearch, { redirectIfMatched } from './components/lookup-search';

export default <Router history={browserHistory} >
  <Route path="/" component={App}>
    <IndexRoute component={Index} />
    <Route path="keywords">
      <IndexRoute component={Keywords} />
      <Route path="search-redirect" component={AsyncLookupSearch} onEnter={redirectIfMatched} />
    </Route>
    <Route path="policies">
      <IndexRoute component={Policies} />
      <Route path="search-redirect" component={AsyncLookupSearch} onEnter={redirectIfMatched} />
    </Route>
    <Route path="requirements" component={Requirements} >
      <IndexRedirect to="/requirements/by-keyword" />
      <Route path="by-keyword" tabName="Requirement" component={ReqsByKeyword} />
      <Route path="by-policy" tabName="Policy" component={ReqsByPolicy} />
    </Route>
  </Route>
</Router>;
