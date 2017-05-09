import React from 'react';
import { Link } from 'react-router';

export default function FilterRemoveView({ heading, linkToRemove, name }) {
  return (
    <li className="active-filter rounded clearfix mb1 flex relative">
      <span className="filter-name col col-9 p1 center">{heading}:<strong>{name}</strong></span>
      <Link
        to={linkToRemove}
        className="remove-filter-link rounded-right col col-3 p1 center flex absolute"
      >
        <span className="close-button center block" />
      </Link>
    </li>
  );
}
FilterRemoveView.propTypes = {
  heading: React.PropTypes.string,
  linkToRemove: React.PropTypes.shape({ pathname: React.PropTypes.string }),
  name: React.PropTypes.string.isRequired,
};
FilterRemoveView.defaultProps = {
  heading: '',
  linkToRemove: { pathname: '/' },
};
