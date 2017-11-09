import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

/* Uses indentation and border to indicate separate sections */
export default function Section({ docNode }) {
  return (
    <div className="node-section" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Section.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
