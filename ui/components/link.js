import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, routes } from '../routes';

export default function Link({ children, href, params, route, ...otherProps }) {
  if (route) {
    return (
      <RouterLink params={params} route={route}>
        <a {...otherProps}>{children}</a>
      </RouterLink>
    );
  } else if (href) {
    const props = {
      ...otherProps,
      href,
    };
    if (href.search(/^https|http|^\/\//) === 0) {
      props.target = '_blank';
      props.rel = 'noopener noreferrer';
      props['aria-label'] = 'Link opens in a new window';
    }
    return <a {...props}>{children}</a>;
  }
}

const existingRoutes = routes.map(r => r.name);
Link.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  params: PropTypes.shape({}),
  route: PropTypes.oneOf([null, ...existingRoutes]),
};

Link.defaultProps = {
  href: null,
  params: {},
  route: null,
};
