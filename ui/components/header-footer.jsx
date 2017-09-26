import PropTypes from 'prop-types';
import React from 'react';

import Disclaimer from './disclaimer';
import Navbar from './navbar';
import Footer from './footer';

function HeaderFooter({ children }) {
  return (
    <div>
      <Disclaimer />
      <Navbar />
      <div className="container">
        {children}
      </div>
      <Footer />
    </div>
  );
}

HeaderFooter.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HeaderFooter;
