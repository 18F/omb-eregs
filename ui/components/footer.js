import React from 'react';

import Link from './link';

export default function Footer() {
  return (
    <footer className="global-footer px4 py3">
      <h2>OMB Policy Library</h2>
      <ul className="list-reset">
        <li><Link href="https://github.com/18F/omb-eregs/">GitHub</Link></li>
        <li><Link route="privacy">Privacy Policy</Link></li>
        <li><Link href="https://github.com/18F/omb-eregs/issues/">Report issue</Link></li>
        <li><Link href="mailto:ofcio@omb.eop.gov">Contact us</Link></li>
      </ul>
    </footer>
  );
}
