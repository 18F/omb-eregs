import Head from 'next/head';
import PropTypes from 'prop-types';
import React from 'react';

import Disclaimer from './disclaimer';
import Navbar from './navbar';
import Footer from './footer';


export default function HeaderFooter({ children }) {
  return (
    <div>
      <Head>
        <title>OMB Policy Library (Beta)</title>
        <link rel="stylesheet" href="/static/styles.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
