import Router from 'next/router';
import withRedux from 'next-redux-wrapper';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import React from 'react';

import createStore from '../store';
import ErrorView from './error';
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


export default function wrapPage(Page, dataFn, headerFooterParams) {
  const hfParams = headerFooterParams || { showSearch: true };
  const noop = () => ({});
  const fetchFn = dataFn || noop;
  function WrappedPage(props) {
    if (props.err || props.statusCode) {
      return <ErrorView err={props.err} statusCode={props.statusCode} />;
    }
    return <HeaderFooter {...hfParams}><Page {...props} /></HeaderFooter>;
  }

  WrappedPage.propTypes = {
    err: PropTypes.shape({}),
    statusCode: PropTypes.number,
  };

  WrappedPage.defaultProps = {
    err: null,
    statusCode: null,
  };

  WrappedPage.getInitialProps = async (ctx) => {
    try {
      return await fetchFn(ctx);
    } catch (err) {
      return { err };
    }
  };
  return withRedux({
    createStore,
    debug: process.env.NODE_ENV === 'development',
  })(WrappedPage);
}
