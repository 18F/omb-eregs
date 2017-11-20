import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderContents from '../../util/render-contents';

/* An h1/2/3/etc. depending on section depth */
export default function Heading({ docNode }) {
  const hLevel = docNode.identifier
    .split('_')
    .filter(e => e === 'sec')
    .length + 1;
  const Component = `h${hLevel}`;
  return (
    <Component className="node-heading" id={docNode.identifier}>
      { renderContents(docNode.content) }
    </Component>
  );
}
Heading.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
