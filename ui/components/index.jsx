import React from 'react';
import { Link } from 'react-router';

export default function Index() {
  return (
    <div>
      <h2>Index</h2>
      <ul>
        <li><Link to="/keywords">Keywords</Link></li>
        <li><Link to="/policies">Policies</Link></li>
        <li><Link to="/requirements">Requirements</Link></li>
      </ul>
    </div>
  );
}
