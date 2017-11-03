import PropTypes from 'prop-types';
import React from 'react';

export default function Th({ children, docNode, renderedContent }) {
  return <th className="basic-th" id={docNode.identifier}>{ renderedContent } { children }</th>;
}
Th.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
Th.defaultProps = {
  children: null,
};
