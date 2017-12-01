import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function Tr({ docNode }) {
  return (
    <tr className="basic-tr" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </tr>
  );
}
Tr.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
