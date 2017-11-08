import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';


export default function FootnoteCitation({ content }) {
  const href = `#${content.footnote_node.identifier}`;
  return <Link className="footnote-link" href={href}><sup>Footnote { content.text }</sup></Link>;
}
FootnoteCitation.propTypes = {
  content: PropTypes.shape({
    footnote_node: PropTypes.shape({
      identifier: PropTypes.string.isRequired,
    }).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

