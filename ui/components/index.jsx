import React from 'react';
import { Link } from 'react-router';

export default function Index() {
  return (
    <div>
      <h2>Index</h2>
      <Link to="/subpath">Go to Subpath</Link>
    </div>
  );
}
