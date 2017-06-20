import React from 'react';
import Search from './search/search';


function Navbar() {
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
        <a href="/" className="text-decoration-none">
          <h1 className="navbar-title">
              OMB IT Policy Library <sup>BETA</sup>
          </h1>
        </a>
        <Search />
      </div>
    </div>
  );
}

export default Navbar;
