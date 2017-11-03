import PropTypes from 'prop-types';
import React from 'react';

export default function Thead({ children, docNode }) {
  return <thead className="basic-thead" id={docNode.identifier}>{ children }</thead>;
}
Thead.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Thead.defaultProps = {
  children: null,
};
