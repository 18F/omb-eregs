import PropTypes from 'prop-types';
import React from 'react';

import HeaderFooter from '../header-footer';

export default function UserError({ message }) {
  return (
    <HeaderFooter>
      <section className="py3">
        <div className="landing-section gold-border pb2">
          <h1 className="h2">Invalid Request</h1>
          <p className="content">{message}</p>
          <div className="my3">
            <a className="button-like" href="/">
              Return home
            </a>
          </div>
        </div>
        <hr className="stars-divider" />
      </section>
    </HeaderFooter>
  );
}

UserError.propTypes = { message: PropTypes.string.isRequired };
