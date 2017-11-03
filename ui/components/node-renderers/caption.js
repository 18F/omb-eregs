import PropTypes from 'prop-types';
import React from 'react';

export default function Caption({ children, docNode }) {
  return (<caption className="basic-caption" id={docNode.identifier}>
    { docNode.text } { children }
  </caption>);
}
Caption.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Caption.defaultProps = {
  children: null,
};
