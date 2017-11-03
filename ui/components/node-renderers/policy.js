import PropTypes from 'prop-types';
import React from 'react';

/* Root of a policy document */
export default function Policy({ children, docNode }) {
  return <div className="node-policy" id={docNode.identifier}>{ children }</div>;
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
