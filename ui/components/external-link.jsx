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
  children: React.PropTypes.node.isRequired,
  href: React.PropTypes.string.isRequired,
};
