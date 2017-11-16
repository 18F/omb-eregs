import PropTypes from 'prop-types';
import React from 'react';

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
  docNode: PropTypes.shape({
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
