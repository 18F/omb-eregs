import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderContents from '../../util/render-contents';

export default function Footnote({ docNode }) {
  return (
    <span className="clearfix node-footnote" id={docNode.identifier}>
      <span className="node-footnote-content">
        <span className="citation-marker">
          { docNode.marker }
        </span>
        <p className="footnote-text">{ renderContents(docNode.content) }</p>
      </span>
    </span>
  );
}
Footnote.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
