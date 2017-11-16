import PropTypes from 'prop-types';
import React from 'react';

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
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string,
  }).isRequired,
};
