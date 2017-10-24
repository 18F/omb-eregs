import PropTypes from 'prop-types';
import React from 'react';

/* Uses indentation and border to indicate separate sections */
export default function Section({ children, docNode }) {
  const style = {
    border: '1px solid black',
    paddingLeft: '1em',
    paddingRight: '1em',
  };
  return <div id={docNode.identifier} style={style}>{children}</div>;
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
