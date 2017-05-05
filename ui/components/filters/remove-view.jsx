import React from 'react';
import { Link } from 'react-router';

export default function FilterRemoveView({ name, linkToRemove }) {
  return (
    <li className="active-filter rounded clearfix mb1 flex relative">
      <span className="filter-name col col-9 p1 center">{name}</span>
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
  name: React.PropTypes.string.isRequired,
  linkToRemove: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }),
};
FilterRemoveView.defaultProps = {
  linkToRemove: { pathname: '/' },
};
