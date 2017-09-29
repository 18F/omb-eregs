import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';

export default function FilterRemoveView({ heading, name, params, route }) {
  return (
    <li className="active-filter rounded mb1 mr1 inline-block">
      <div className="filter-name left">
        {heading}:&nbsp;<strong>{name}</strong>
      </div>
      <Link params={params} route={route}>
        <a className="remove-filter-link block left">Remove filter</a>
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
