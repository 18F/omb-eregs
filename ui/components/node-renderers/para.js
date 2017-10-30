import PropTypes from 'prop-types';
import React from 'react';

/* Paragraph of text */
export default function Paragraph({ children, docNode }) {
  return (
    <div id={docNode.identifier}>
      <p>{docNode.text}</p>
      { children }
    </div>
  );
}
Paragraph.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
Paragraph.defaultProps = {
  children: null,
};
