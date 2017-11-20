import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

/* Uses indentation and border to indicate separate sections */
export default function Section({ docNode }) {
  return (
    <div className="node-section" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
    </div>
  );
}
Section.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
