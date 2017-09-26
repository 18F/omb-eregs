import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

export default function TabView({ active, link, tabName }) {
  if (active) {
    return <li className="inline-block mr4 bold">{ tabName }</li>;
  }
  return (
    <li className="inline-block mr4">
      <Link to={link} >{ tabName }</Link>
    </li>
  );
}

TabView.propTypes = {
  active: PropTypes.bool.isRequired,
  link: PropTypes.shape({
    pathname: PropTypes.string,
    query: PropTypes.shape({}),
  }),
  tabName: PropTypes.string.isRequired,
};
TabView.defaultProps = {
  link: { pathname: '', query: {} },
};
