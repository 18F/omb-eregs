import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function List({ docNode }) {
  return (
    <ol className="list-reset node-list" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </ol>
  );
}
List.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
