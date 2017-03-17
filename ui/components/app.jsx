import React from 'react';

function App(props) {
  return (
    <div>
      <h1>OMB Policy</h1>
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

export default App;
