import PropTypes from 'prop-types';
import React from 'react';

/* An h1/2/3/etc. depending on section depth */
export default function Heading({ children, docNode }) {
  const hLevel = docNode.identifier
    .split('_')
    .filter(e => e === 'sec')
    .length + 1;
  const Component = `h${hLevel}`;
  return (
    <Component className="node-heading" id={docNode.identifier}>
      { children }
    </Component>
  );
}
Heading.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
Heading.defaultProps = {
  children: null,
};
