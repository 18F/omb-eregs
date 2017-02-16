import React from 'react';

export default function App(props) {
  return (
    <div>
      <h1>App</h1>
      {props.children}
    </div>
  );
}

App.defaultProps = {
  children: null,
};

App.propTypes = {
  children: React.PropTypes.node,
};

