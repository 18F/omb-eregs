import React from 'react';
import Disclaimer from './disclaimer';
import Navbar from './navbar';
import Footer from './footer';

function App(props) {
  return (
    <div>
      <Disclaimer />
      <Navbar />
      {props.children}
      <Footer />
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
