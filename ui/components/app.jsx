import React from 'react';

function App(props) {
  return (
    <div>
      <div>
        <h1>App</h1>
      </div>
      <div className="clearfix">
        {props.children}
      </div>
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
