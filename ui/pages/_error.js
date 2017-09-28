import React from 'react';

import ErrorView from '../components/error';

export default function ErrorPage({ err, statusCode }) {
  return <ErrorView err={err} statusCode={statusCode} />;
}
ErrorPage.propTypes = ErrorView.propTypes;
ErrorPage.getInitialProps = ({ err, jsonPageRes, res }) => {
  if (err) return { err };
  if (res) return { statusCode: res.statusCode };
  return { statusCode: jsonPageRes.status };
};
