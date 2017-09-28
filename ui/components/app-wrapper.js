import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import React from 'react';

import ErrorPage from './error';
import HeaderFooter from './header-footer';


Router.onRouteChangeComplete = NProgress.done;
Router.onRouteChangeError = NProgress.done;
Router.onRouteChangeStart = NProgress.start;


export default function wrapPage(Page, dataFn) {
  function WrappedPage(props) {
    if (props.err) return <ErrorPage err={props.err} />;
    return <HeaderFooter><Page {...props} /></HeaderFooter>;
  }
  WrappedPage.propTypes = { err: PropTypes.shape({}) };
  WrappedPage.defaultProps = { err: null };
  WrappedPage.getInitialProps = (ctx) => {
    try {
      return dataFn(ctx).catch(err => ({ err }));
    } catch (err) {
      return { err };
    }
  };
  return WrappedPage;
}
