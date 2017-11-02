import PropTypes from 'prop-types';
import React from 'react';

export default function List({ children, docNode }) {
  return <ol className="list-reset" id={docNode.identifier}>{ children }</ol>;
}
List.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
List.defaultProps = {
  children: null,
};
