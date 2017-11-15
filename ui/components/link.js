import PropTypes from 'prop-types';
import React from 'react';

import { Link as RouterLink, routes } from '../routes';

export default class Link extends React.Component {
  focus() {
    if (this.el) {
      this.el.focus();
    }
  }

  render() {
    const { children, href, params, route, ...otherProps } = this.props;

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
      }
      return <a {...props} ref={(el) => { this.el = el; }}>{children}</a>;
    }
    throw new Error('Link created without an href or route');
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
