import PropTypes from 'prop-types';
import React from 'react';

import renderContents from '../../util/render-contents';
import renderNode from '../../util/render-node';

/* We've been asked to render a node we don't have a renderer for. We'll do
 * our best but flag it when in development mode */
export default function Fallback({ docNode }) {
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
      <p className="m0">{ renderContents(docNode.content) }</p>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Fallback.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
