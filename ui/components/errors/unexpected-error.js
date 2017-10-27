import HTTPStatus from 'http-status';
import PropTypes from 'prop-types';
import React from 'react';

import { ContactEmail } from '../contact-email';

/* Note that we intentionally avoid "Link" to minimize sources of error */

export default function UnexpectedError({ statusCode }) {
  return (
    <section>
      <h1>{HTTPStatus[statusCode] || 'Unexpected error'}</h1>
      <p>
        Visit our <a href="/">homepage</a> or{' '}
        <ContactEmail text="contact us" /> if{' '}
        you need additional help.
      </p>
    </section>
  );
}

UnexpectedError.propTypes = { statusCode: PropTypes.number };
UnexpectedError.defaultProps = { statusCode: 0 };
