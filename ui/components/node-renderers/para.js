import PropTypes from 'prop-types';
import React from 'react';

/* Paragraph of text */
export default function Paragraph({ children, docNode, renderedContent }) {
  const klasses = ['node-', docNode.node_type].join('');
  return (
    <div className={klasses} id={docNode.identifier}>
      <p>{renderedContent}</p>
      { children }
    </div>
  );
}
Paragraph.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
Paragraph.defaultProps = {
  children: null,
};
