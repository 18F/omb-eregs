import PropTypes from 'prop-types';
import React from 'react';

/* Uses indentation and border to indicate separate sections */
export default function Section({ children, docNode }) {
  return <div className="node-section" id={docNode.identifier}>{children}</div>;
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
