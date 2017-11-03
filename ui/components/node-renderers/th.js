import PropTypes from 'prop-types';
import React from 'react';

export default function Th({ children, docNode }) {
  return <th className="basic-th" id={docNode.identifier}>{ docNode.text } { children }</th>;
}
Th.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Th.defaultProps = {
  children: null,
};
