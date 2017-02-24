import React from 'react';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';

import App from './components/app';
import Keywords from './components/keywords';
import Index from './components/index';
import Requirements from './components/requirements';


export default <Router history={browserHistory} >
  <Route path="/" component={App}>
    <IndexRoute component={Index} />
    <Route path="keywords" component={Keywords} />
    <Route path="requirements/:req_id" component={Requirements} />
    <Route path="requirements" component={Requirements} />
  </Route>
</Router>;
