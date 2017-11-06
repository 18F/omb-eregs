import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

export default function Th({ children, docNode }) {
  return (
    <th className="basic-th" id={docNode.identifier}>
      { children }
      { docNode.children.map(renderNode) }
    </th>
  );
}
Th.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Th.defaultProps = {
  children: null,
};
