import PropTypes from 'prop-types';
import React from 'react';

export default function Td({ children, docNode, renderedContent }) {
  return <td className="basic-td" id={docNode.identifier}>{ renderedContent } { children }</td>;
}
Td.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
Td.defaultProps = {
  children: null,
};
