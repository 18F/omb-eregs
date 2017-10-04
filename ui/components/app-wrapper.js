import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import React from 'react';

import ErrorPage from './error';
import HeaderFooter from './header-footer';


Router.onRouteChangeComplete = (url) => {
  NProgress.done();
  // Trigger DAP pageviews when our history changes (for single-page-app users)
  if (typeof gas !== 'undefined') {
    // Provided by DAP
    gas('send', 'pageview', url);
  }
};
Router.onRouteChangeError = NProgress.done;
Router.onRouteChangeStart = NProgress.start;


export default function wrapPage(Page, dataFn) {
  function WrappedPage(props) {
    if (props.err) return <ErrorPage err={props.err} />;
    return <HeaderFooter showSearch={ showSearch(props.url.pathname) }><Page {...props} /></HeaderFooter>;
  }

  function showSearch(route) {
    if (route == "/") {
      return false;
    }
    return true;
  }

  WrappedPage.propTypes = {
    err: PropTypes.shape({})
  };

  WrappedPage.defaultProps = {
    err: null
  };

  WrappedPage.getInitialProps = (ctx) => {
    try {
      return dataFn(ctx).catch(err => ({ err }));
    } catch (err) {
      return { err };
    }
  };
  return WrappedPage;
}
