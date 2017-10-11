import PropTypes from 'prop-types';
import React from 'react';

import { Link as RouterLink, routes } from '../routes';

function getAriaProps(props) {
  const ariaProps = Object.keys(props).filter(name => name.match(/^aria-/));
  const otherProps = ariaProps.map(name => ({ name, value: props[name] }))
    .reduce((accum, next) => ({
      ...accum,
      [next.name]: next.value,
    }), {});

  return otherProps;
}

export default function Link({ children, className, href, params, route, ...props }) {
  const ariaProps = getAriaProps(props);
  if (route) {
    return (
      <RouterLink params={params} route={route}>
        <a className={className} {...ariaProps}>{children}</a>
      </RouterLink>
    );
  } else if (href) {
    const attrs = href.search(/^https|http|^\/\//) === 0 ? {
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': 'Link opens in a new window',
    } : {};
    return (
      <a className={className} href={href} {...attrs} {...ariaProps} >
        {children}
      </a>
    );
  }
}

const existingRoutes = routes.map(r => r.name);
/* eslint-disable consistent-return, react/forbid-prop-types */
Link.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  params: PropTypes.object,
  route: PropTypes.oneOf([null, ...existingRoutes]),
};
/* eslint-enable consistent-return, react/forbid-prop-types */

Link.defaultProps = {
  className: '',
  href: null,
  params: {},
  route: null,
};
