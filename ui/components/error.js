import HTTPStatus from 'http-status';
import PropTypes from 'prop-types';
import React from 'react';

import HeaderFooter from './header-footer';

export function FourOhFour() {
  return (
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">
            We can&rsquo;t find the page you&rsquo;re looking for.
          </h1>
          <p className="content">
            Visit our <a href="/">homepage</a>
            {' '}or <a href="mailto:ofcio@omb.eop.gov">contact us</a>
            {' '}if you need additional help.
          </p>
          <div className="my3">
            <a className="button-like" href="/">Return home</a>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  );
}

export function UserError({ message }) {
  return (
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">Invalid Request</h1>
          <p className="content">{ message }</p>
          <div className="my3">
            <a className="button-like" href="/">Return home</a>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  );
}
UserError.propTypes = { message: PropTypes.string.isRequired };

export function UnexpectedError({ statusCode }) {
  return (
    <section>
      <h1>{ HTTPStatus[statusCode] || 'Unexpected error' }</h1>
      <p>
        Visit our <a href="/">homepage</a>
        {' '}or <a href="mailto:ofcio@omb.eop.gov">contact us</a>
        {' '}if you need additional help.
      </p>
    </section>
  );
}
UnexpectedError.propTypes = { statusCode: PropTypes.number };
UnexpectedError.defaultProps = { statusCode: 0 };

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
