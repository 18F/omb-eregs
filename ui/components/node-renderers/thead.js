import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function Thead({ docNode }) {
  return (
    <thead className="basic-thead" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </thead>
  );
}
Thead.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
