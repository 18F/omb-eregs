import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

export default function Caption({ children, docNode }) {
  return (
    <caption className="node-caption" id={docNode.identifier}>
      { children }
      { docNode.children.map(renderNode) }
    </caption>
  );
}
Caption.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Caption.defaultProps = {
  children: null,
};
