import PropTypes from 'prop-types';
import React from 'react';

export default function Footnote({ docNode, renderedContent }) {
  return (
    <div className="clearfix node-footnote" id={docNode.identifier}>
      <span className="bold col col-1 pr2 right-align">
        { docNode.marker }
      </span>
      <p className="col col-11 m0 text">{ renderedContent }</p>
    </div>
  );
}
Footnote.propTypes = {
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    marker: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
