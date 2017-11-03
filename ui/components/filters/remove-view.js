import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

export default function FilterRemoveView({ heading, name, params, route }) {
  return (
    <li className="active-filter rounded mb1 mr1 inline-block">
      <div className="filter-name left">
        {heading}:&nbsp;<strong>{name}</strong>
      </div>
      <Link className="remove-filter-link block left" params={params} route={route}>
        Remove filter
      </Link>
    </li>
  );
}

FilterRemoveView.propTypes = {
  heading: PropTypes.string,
  name: PropTypes.string.isRequired,
  params: PropTypes.shape({}).isRequired,
  route: PropTypes.string.isRequired,
};

FilterRemoveView.defaultProps = {
  heading: '',
};
