import React from 'react';
import Disclaimer from './disclaimer';
import Navbar from './navbar';
import Footer from './footer';

function App(props) {
  return (
    <div>
      <Disclaimer />
      <Navbar router={props.router} />
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
  router: React.PropTypes.shape.isRequired,
};

export default App;
