import PropTypes from 'prop-types';
import React from 'react';

import FourOhFour from './errors/four-oh-four-error';
import UnexpectedError from './errors/unexpected-error';
import UserError from './errors/user-error';

export default function ErrorView({ err, statusCode }) {
  if (statusCode === 404) {
    return <FourOhFour />;
  } else if (err && err.statusCode === 400) {
    return <UserError message={err.message || err.msg} />;
  }
  return <UnexpectedError statusCode={statusCode} />;
}
ErrorView.propTypes = {
  err: PropTypes.shape({
    statusCode: PropTypes.number,
    msg: PropTypes.string,
  }),
  statusCode: PropTypes.number,
};
ErrorView.defaultProps = { err: null, statusCode: 0 };
