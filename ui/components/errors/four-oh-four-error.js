import React from 'react';

import HeaderFooter from '../header-footer';

export default function FourOhFour() {
  return (
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">We can&rsquo;t find the page you&rsquo;re looking for.</h1>
          <p className="content">
            Visit our <a href="/">homepage</a> or <a href="mailto:ofcio@omb.eop.gov">contact us</a>{' '}
            if you need additional help.
          </p>
          <div className="my3">
            <a className="button-like" href="/">
              Return home
            </a>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  );
}
