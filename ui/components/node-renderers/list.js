import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

export default function List({ docNode }) {
  return (
    <ol className="list-reset node-list" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </ol>
  );
}
List.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
