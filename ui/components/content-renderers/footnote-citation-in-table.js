import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

export default function FootnoteCitationInTable({ content }) {
  const href = `#${content.footnote_node.identifier}-table`;
  return <sup><Link href={href}>{ content.text }</Link></sup>;
}
FootnoteCitationInTable.propTypes = {
  content: PropTypes.shape({
    footnote_node: PropTypes.shape({
      identifier: PropTypes.string.isRequired,
    }).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
