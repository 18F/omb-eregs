import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import FootnoteCitation from '../components/content-renderers/footnote-citation';
import PlainText from '../components/content-renderers/plain-text';
import Fallback from '../components/node-renderers/fallback';
import footnote from '../components/node-renderers/footnote';
import heading from '../components/node-renderers/heading';
import list from '../components/node-renderers/list';
import listitem from '../components/node-renderers/list-item';
import math from '../components/node-renderers/math';
import para from '../components/node-renderers/para';
import policy from '../components/node-renderers/policy';
import sec from '../components/node-renderers/sec';
import { documentData } from '../util/api/queries';


const nodeMapping = {
  footnote,
  heading,
  list,
  listitem,
  math,
  para,
  policy,
  sec,
};
const contentMapping = {
  footnote_citation: FootnoteCitation,
};

/* Recursively converts a docNode into React components, depending on each
 * node's node_type. Analogously, converts each node's "content" array
 * depending on the content's content_type. */
export function Document({ docNode }) {
  const NodeComponent = nodeMapping[docNode.node_type] || Fallback;
  const renderedContent = docNode.content.map((content, idx) => {
    const ContentComponent = contentMapping[content.content_type] || PlainText;
    // We're guaranteed these have a consistent order
    /* eslint-disable react/no-array-index-key */
    return <ContentComponent content={content} key={idx} />;
    /* eslint-enable react/no-array-index-key */
  });
  return (
    <NodeComponent docNode={docNode} renderedContent={renderedContent}>
      { docNode.children.map(c => <Document docNode={c} key={c.identifier} />) }
    </NodeComponent>
  );
}
Document.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})), // recursive
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
    identifier: PropTypes.string.isRequired,
    node_type: PropTypes.string.isRequired,
  }).isRequired,
};

export default wrapPage(Document, documentData);
