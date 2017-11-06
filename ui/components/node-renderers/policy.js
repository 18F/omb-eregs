import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

/* Root of a policy document */
export default function Policy({ docNode }) {
  return (
    <div className="node-policy" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Policy.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
