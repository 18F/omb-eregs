import React from 'react';

import Search from './search/search';


function Navbar() {
  return (
    <div className="items-center navbar">
      <div className="homepage-link items-center">
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
      <div className="items-center header-search">
        <Search />
      </div>
    </div>
  );
}

export default Navbar;
