import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

export default function Table({ docNode }) {
  return (
    <table className="basic-table" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </table>
  );
}
Table.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
