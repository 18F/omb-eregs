import PropTypes from 'prop-types';
import React from 'react';

/* Root of a policy document */
export default function Policy({ children, docNode }) {
  const klasses = ['node-', docNode.node_type].join('');
  return <div className={klasses} id={docNode.identifier}>{ children }</div>;
}
Policy.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Policy.defaultProps = {
  children: null,
};
