import PropTypes from 'prop-types';
import React from 'react';

import renderNode from '../../util/render-node';

export default function ListItem({ docNode }) {
  let markerType;
  if (docNode.marker == "•") {
    markerType = "list-style-bullet";
  } else if (docNode.marker.match(/\d+/g) != null) {
    markerType = "list-style-number";
  }

  return (
    <li className={"node-list-item " + markerType} id={docNode.identifier}>
      <span className="list-item-marker">{ docNode.marker }</span>
      <div className="list-item-text">{ docNode.children.map(renderNode) }</div>
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
