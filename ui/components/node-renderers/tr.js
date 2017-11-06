import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

export default function Tr({ docNode }) {
  return (
    <tr className="basic-tr" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </tr>
  );
}
Tr.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
