import React from 'react';

import App from '../app';
import Html from '../html';


// Prevent the page from loading the dynamic JS, which will display a
// blank page due to not finding the route.
export default () => (
  <Html allowDynamic={false}>
    <App>
      <h1>Page not found</h1>
      <p>Please check the URL and try again</p>
    </App>
  </Html>
);
