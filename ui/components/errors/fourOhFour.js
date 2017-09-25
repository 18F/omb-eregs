import React from 'react';

import Html from '../html';
import HeaderFooter from '../header-footer';


// Prevent the page from loading the dynamic JS, which will display a
// blank page due to not finding the route.
export default () => (
  <Html allowDynamic={false}>
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">
            We can&rsquo;t find the page you&rsquo;re looking for.
          </h1>
          <p className="content">
            Visit our <a href="/">homepage</a>
            {' '}or <a href="mailto:ofcio@omb.eop.gov">contact us</a>
            {' '}if you need additional help.
          </p>
          <div className="my3">
            <a className="button-like" href="/">Return home</a>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  </Html>
);
