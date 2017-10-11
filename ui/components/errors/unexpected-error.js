import HTTPStatus from 'http-status';
import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

export default function UnexpectedError({ statusCode }) {
  return (
    <section>
      <h1>{HTTPStatus[statusCode] || 'Unexpected error'}</h1>
      <p>
        Visit our <Link route="homepage">homepage</Link> or{' '}
        <a href="mailto:ofcio@omb.eop.gov">contact us</a> if{' '}
        you need additional help.
      </p>
    </section>
  );
}

UnexpectedError.propTypes = { statusCode: PropTypes.number };
UnexpectedError.defaultProps = { statusCode: 0 };
