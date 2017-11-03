import PropTypes from 'prop-types';
import React from 'react';

export default function Tr({ children, docNode }) {
  return <tr className="basic-tr" id={docNode.identifier}>{ children }</tr>;
}
Tr.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Tr.defaultProps = {
  children: null,
};
