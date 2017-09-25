import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

export default function FilterRemoveView({ heading, linkToRemove, name }) {
  return (
    <li className="active-filter rounded mb1 mr1 inline-block">
      <div className="filter-name left">
        {heading}:&nbsp;<strong>{name}</strong>
      </div>
      <Link
        to={linkToRemove}
        className="remove-filter-link block left"
      >
      Remove filter
      </Link>
    </li>
  );
}
FilterRemoveView.propTypes = {
  heading: PropTypes.string,
  linkToRemove: PropTypes.shape({ pathname: PropTypes.string }),
  name: PropTypes.string.isRequired,
};
FilterRemoveView.defaultProps = {
  heading: '',
  linkToRemove: { pathname: '/' },
};
