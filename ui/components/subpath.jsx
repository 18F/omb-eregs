import React from 'react';
import { Link } from 'react-router';

export default function Subpath() {
  return (
    <div>
      <h2>Subpath</h2>
      <Link to="/">Go to Index</Link>
    </div>
  );
}
