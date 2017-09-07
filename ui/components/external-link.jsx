import PropTypes from 'prop-types';
import React from 'react';


export default function ExternalLink({ children, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Link opens in a new window"
    >
      { children }
    </a>);
}
ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};
