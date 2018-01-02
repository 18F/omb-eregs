import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function ListItem({ docNode }) {
  let title = null;
  if (docNode.title) {
    title = <strong className="list-item-title">{ docNode.title }</strong>;
  }
  return (
    <li className="node-list-item" id={docNode.identifier}>
      <span className="list-item-marker">{ docNode.marker }</span>
      <div className="list-item-text">
        { title }
        { docNode.children.map(renderNode) }
      </div>
    </li>
  );
}

ListItem.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
