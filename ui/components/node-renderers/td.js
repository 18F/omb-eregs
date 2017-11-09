import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

export default function Td({ children, docNode }) {
  return (
    <td className="basic-td" id={docNode.identifier}>
      { children }
      { docNode.children.map(renderNode) }
    </td>
  );
}
Td.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Td.defaultProps = {
  children: null,
};
