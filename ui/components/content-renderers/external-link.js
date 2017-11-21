import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

export default function ExternalLink({ content }) {
  const className = content.href === content.text ? '' : 'print-url';
  return <Link className={className} href={content.href}>{ content.text }</Link>;
}
ExternalLink.propTypes = {
  content: PropTypes.shape({
    href: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

