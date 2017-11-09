import PropTypes from 'prop-types';
import React from 'react';

export default function Footnote({ children, docNode }) {
  return (
    <span className="clearfix node-footnote" id={docNode.identifier}>
      <span className="node-footnote-content">
        <span className="citation-count">
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
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string.isRequired,
  }).isRequired,
};
Footnote.defaultProps = {
  children: null,
};
