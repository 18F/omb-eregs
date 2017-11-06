import PropTypes from 'prop-types';
import React from 'react';
import katex from 'katex';


export default function TeXMath({ docNode }) {
  /* eslint-disable react/no-danger */
  return (
    <div id={docNode.identifier}>
      <div dangerouslySetInnerHTML={{ __html: katex.renderToString(docNode.text) }} />
    </div>
  );
  /* eslint-enable react/no-danger */
}

TeXMath.propTypes = {
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

TeXMath.defaultProps = {
  children: null,
};
