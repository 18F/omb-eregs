import PropTypes from 'prop-types';
import React from 'react';

export default function Caption({ children, docNode, renderedContent }) {
  return (<caption className="basic-caption" id={docNode.identifier}>
    { renderedContent } { children }
  </caption>);
}
Caption.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
Caption.defaultProps = {
  children: null,
};
