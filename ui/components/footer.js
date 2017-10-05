import React from 'react';

import { Link } from '../routes';

export default function Footer() {
  return (
    <footer className="global-footer px4 py3">
      <h2>OMB Policy Library</h2>
      <ul className="list-reset">
        <li><a href="https://github.com/18F/omb-eregs/">GitHub</a></li>
        <li><Link route="privacy"><a>Privacy Policy</a></Link></li>
        <li><a href="https://github.com/18F/omb-eregs/issues/">Report issue</a></li>
        <li><a href="mailto:ofcio@omb.eop.gov">Contact us</a></li>
      </ul>
    </footer>
  );
}
