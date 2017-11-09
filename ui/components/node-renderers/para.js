import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

/* Paragraph of text */
export default function Paragraph({ children, docNode }) {
  return (
    <div className="node-paragraph" id={docNode.identifier}>
      <p className="m0">{ children }</p>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Paragraph.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Paragraph.defaultProps = {
  children: null,
};
