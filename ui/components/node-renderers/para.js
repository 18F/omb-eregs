import PropTypes from 'prop-types';
import React from 'react';

/* Paragraph of text */
export default function Paragraph({ children, docNode, renderedContent }) {
  const className = "node-" + docNode.node_type;
  return (
    <div className={className} id={docNode.identifier}>
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
