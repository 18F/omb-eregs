import React from 'react';

export default function App(props) {
  return (
    <div>
      <h1>App</h1>
      {props.children}
    </div>
  );
}
