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
  active: React.PropTypes.bool.isRequired,
  link: React.PropTypes.shape({
    pathname: React.PropTypes.string,
    query: React.PropTypes.shape({}),
  }),
  tabName: React.PropTypes.string.isRequired,
};
TabView.defaultProps = {
  link: { pathname: '', query: {} },
};
