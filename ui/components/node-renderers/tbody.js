import PropTypes from 'prop-types';
import React from 'react';

export default function Tbody({ children, docNode }) {
  return <tbody className="basic-tbody" id={docNode.identifier}>{ children }</tbody>;
}
Tbody.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Tbody.defaultProps = {
  children: null,
};
