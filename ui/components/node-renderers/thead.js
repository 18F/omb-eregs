import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

export default function Thead({ docNode }) {
  return (
    <thead className="basic-thead" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </thead>
  );
}
Thead.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
