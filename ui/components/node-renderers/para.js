import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderContents from '../../util/render-contents';
import renderNode from '../../util/render-node';

/* Paragraph of text */
export default function Paragraph({ docNode }) {
  return (
    <div className="node-paragraph" id={docNode.identifier}>
      <p className="m0">{ renderContents(docNode.content) }</p>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Paragraph.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
