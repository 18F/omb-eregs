import PropTypes from 'prop-types';
import React from 'react';

/* Uses indentation and border to indicate separate sections */
export default function Section({ children, docNode }) {
  const className = "node-" + docNode.node_type;
  return <div className={className} id={docNode.identifier}>{children}</div>;
}
Section.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Section.defaultProps = {
  children: null,
};
