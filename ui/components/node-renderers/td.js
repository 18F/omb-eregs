import PropTypes from 'prop-types';
import React from 'react';

export default function Td({ children, docNode }) {
  return <td className="basic-td" id={docNode.identifier}>{ docNode.text } { children }</td>;
}
Td.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Td.defaultProps = {
  children: null,
};
