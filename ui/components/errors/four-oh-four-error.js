import React from 'react';

import Link from '../link';
import HeaderFooter from '../header-footer';

export default function FourOhFour() {
  return (
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">We can&rsquo;t find the page you&rsquo;re looking for.</h1>
          <p className="content">
            Visit our <Link route="homepage">homepage</Link> or
            {' '}<Link href="mailto:ofcio@omb.eop.gov">contact us</Link>{' '}
            if you need additional help.
          </p>
          <div className="my3">
            <Link className="button-like" route="homepage">Return home</Link>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  );
}
