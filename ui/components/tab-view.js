import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../routes';

export default function TabView({ active, params, route, tabName }) {
  if (active) {
    return <li className="inline-block mr4 bold">{ tabName }</li>;
  }
  return (
    <li className="inline-block mr4">
      <Link route={route} params={params}>
        <a>{tabName}</a>
      </Link>
    </li>
  );
}

TabView.propTypes = {
  active: PropTypes.bool.isRequired,
  params: PropTypes.shape({}),
  route: PropTypes.string,
  tabName: PropTypes.string.isRequired,
};
TabView.defaultProps = {
  params: {},
  route: '',
};
