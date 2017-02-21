import React from 'react';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';

import App from './components/app';
import Index from './components/index';
import Subpath from './components/subpath';


export default <Router history={browserHistory} >
  <Route path="/" component={App}>
    <IndexRoute component={Index} />
    <Route path="subpath" component={Subpath} />
  </Route>
</Router>;
