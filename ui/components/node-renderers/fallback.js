import PropTypes from 'prop-types';
import React from 'react';

/* We've been asked to render a node we don't have a renderer for. We'll do
 * our best but flag it when in development mode */
export default function Fallback({ children, docNode, renderedContent }) {
  const params = { id: docNode.identifier };
  if (process.env.NODE_ENV === 'development') {
    params.style = { backgroundColor: 'pink' };
    params.title = docNode.identifier;
  }
  params.className = "node-" + docNode.node_type;
  return (
    <div {...params}>
      <p style={{ margin: 0 }}>{ renderedContent }</p>
      { children }
    </div>
  );
}
Fallback.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
Fallback.defaultProps = {
  children: null,
};
