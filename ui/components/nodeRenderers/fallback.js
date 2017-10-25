import PropTypes from 'prop-types';
import React from 'react';

/* We've been asked to render a node we don't have a renderer for. We'll do
 * our best but flag it when in development mode */
export default function Fallback({ children, docNode }) {
  const params = { id: docNode.identifier };
  if (process.env.NODE_ENV === 'development') {
    params.style = { backgroundColor: 'pink' };
    params.title = docNode.identifier;
  }
  return (
    <div {...params}>
      <p style={{ margin: 0 }}>{ docNode.text }</p>
      { children }
    </div>
  );
}
Fallback.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    text: PropTypes.string,
  }).isRequired,
};
Fallback.defaultProps = {
  children: null,
};
