import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

export default function Tbody({ docNode }) {
  return (
    <tbody className="basic-tbody" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </tbody>
  );
}
Tbody.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
