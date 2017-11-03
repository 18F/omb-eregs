import PropTypes from 'prop-types';
import React from 'react';

export default function Table({ children, docNode }) {
  return <table className="basic-table" id={docNode.identifier}>{ children }</table>;
}
Table.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Table.defaultProps = {
  children: null,
};
