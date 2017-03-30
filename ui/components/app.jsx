import React from 'react';
import Disclaimer from './disclaimer';
import Navbar from './navbar';

function App(props) {
  return (
    <div>
      <Disclaimer />
      <Navbar />
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
