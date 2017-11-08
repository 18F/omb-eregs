import PropTypes from 'prop-types';
import React from 'react';
import renderNode from '../../util/render-node';

export default function ListItem({ docNode }) {
  return (
    <li className="clearfix node-list-item" id={docNode.identifier}>
      <span className="col col-1 right-align pr2">{ docNode.marker }</span>
      <div className="col col-11">{ docNode.children.map(renderNode) }</div>
    </li>
  );
}
ListItem.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string.isRequired,
  }).isRequired,
};
