import PropTypes from 'prop-types';
import React from 'react';

export default function Footnote({ children, docNode }) {
  return (
    <div className="clearfix node-footnote" id={docNode.identifier}>
      <span className="bold col col-1 pr2 right-align">
        { docNode.marker }
      </span>
      <p className="col col-11 m0 footnote-text">{ children }</p>
    </div>
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
