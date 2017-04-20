import React from 'react';
import { Link } from 'react-router';

export default function Index() {
  return (
    <div>
      <h2>Index</h2>
      <ul>
        <li><Link to="/topics">Topics</Link></li>
        <li><Link to="/policies">Policies</Link></li>
        <li><Link to="/requirements/by-topic">Requirements</Link></li>
      </ul>
    </div>
  );
}
