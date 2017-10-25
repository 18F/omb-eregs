import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import Fallback from '../components/nodeRenderers/fallback';
import heading from '../components/nodeRenderers/heading';
import para from '../components/nodeRenderers/para';
import policy from '../components/nodeRenderers/policy';
import sec from '../components/nodeRenderers/sec';
import { documentData } from '../util/api/queries';

const componentMapping = {
  heading,
  para,
  policy,
  sec,
};

/* Recursively converts a docNode into React components, depending on each
 * node's node_type */
export function Document({ docNode }) {
  const Component = componentMapping[docNode.node_type] || Fallback;
  return (
    <Component docNode={docNode}>
      { docNode.children.map(c => <Document docNode={c} key={c.identifier} />) }
    </Component>
  );
}
Document.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})), // recursive
    identifier: PropTypes.string.isRequired,
    node_type: PropTypes.string.isRequired,
  }).isRequired,
};

export default wrapPage(Document, documentData);
