import React from 'react';

import Search from './search/search';


function Navbar(props) {
  return (
    <div className="overflow-auto">
      <div className="flex items-center navbar">
        <img
          className="pl2 pr1"
          alt="US flag"
          width="50"
          height="50"
          src="/static/img/omb-logo.png"
        />
        <h1 className="navbar-title">
            OMB Policy Library <sup>BETA</sup>
        </h1>
      </div>
      <Search router={props.router} />
    </div>
  );
}

Navbar.propTypes = {
  router: React.PropTypes.shape.isRequired,
};

export default Navbar;
