import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export default function Tbody({ docNode }) {
  return (
    <tbody className="basic-tbody" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </tbody>
  );
}
Tbody.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
