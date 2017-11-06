import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

/* We've been asked to render a node we don't have a renderer for. We'll do
 * our best but flag it when in development mode */
export default function Fallback({ children, docNode }) {
  const props = {
    className: 'node-fallback',
    id: docNode.identifier,
  };
  if (process.env.NODE_ENV === 'development') {
    props.style = { backgroundColor: 'pink' };
    props.title = docNode.identifier;
  }
  return (
    <div {...props}>
      <p className="m0">{ children }</p>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Fallback.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Fallback.defaultProps = {
  children: null,
};
