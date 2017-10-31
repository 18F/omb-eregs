import PropTypes from 'prop-types';
import React from 'react';

/* An h1/2/3/etc. depending on section depth */
export default function Heading({ docNode, renderedContent }) {
  const hLevel = docNode.identifier
    .split('_')
    .filter(e => e === 'sec')
    .length + 1;
  const Component = `h${hLevel}`;
  return <Component id={docNode.identifier}>{ renderedContent }</Component>;
}
Heading.propTypes = {
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
  renderedContent: PropTypes.node.isRequired,
};
