import React from 'react';
import { browserHistory, IndexRedirect, IndexRoute, Route, Router } from 'react-router';

import App from './components/app';
import Keywords from './components/keywords';
import Index from './components/index';
import Policies from './components/policies';
import Requirements from './components/requirements/container';
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
    <Route path="requirements">
      <IndexRedirect to="./by-requirement" />
      <Route path="by-requirement" component={Requirements} />
    </Route>
  </Route>
</Router>;
