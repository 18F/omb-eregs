import PropTypes from 'prop-types';
import React from 'react';
import Link from '../link';


export default function FootnoteCitation({ content }) {
  const href = `#${content.footnote_node}`;
  return <Link className="footnote-link" href={href}><sup>Footnote { content.text }</sup></Link>;
}
FootnoteCitation.propTypes = {
  content: PropTypes.shape({
    footnote_node: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

