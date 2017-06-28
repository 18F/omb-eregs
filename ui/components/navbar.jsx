import React from 'react';
import Search from './search/search';


function Navbar() {
  return (
    <div className="items-center navbar flex">
      <div className="homepage-link items-center flex">
        <img
          className="pl2 pr1"
          alt="US flag"
          width="50"
          height="50"
          src="/static/img/omb-logo.png"
        />
        <a href="/" className="text-decoration-none">
          <h1 className="navbar-title">
              OMB IT Policy Library <sup>BETA</sup>
          </h1>
        </a>
      </div>
      <div className="items-center header-search flex">
        <Search />
      </div>
    </div>
  );
}

export default Navbar;
