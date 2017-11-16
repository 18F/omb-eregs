import PropTypes from 'prop-types';
import React from 'react';

export default function Footnote({ children, docNode }) {
  return (
    <span className="clearfix node-footnote" id={docNode.identifier}>
      <span className="node-footnote-content">
        <span className="citation-marker">
          { docNode.marker }
        </span>
        <p className="footnote-text">{ children }</p>
      </span>
    </span>
  );
}

Footnote.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string,
  }).isRequired,
};
Footnote.defaultProps = {
  children: null,
  docNode: {
    children: [],
    identifier: '',
    marker: '',
  },
};
