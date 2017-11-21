import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function ListItem({ docNode }) {
  return (
    <li className="node-list-item" id={docNode.identifier}>
      <span className="list-item-marker">{ docNode.marker }</span>
      <div className="list-item-text">{ docNode.children.map(renderNode) }</div>
    </li>
  );
}

ListItem.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
