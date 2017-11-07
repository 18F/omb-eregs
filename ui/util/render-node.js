import React from 'react';

import FootnoteCitation from '../components/content-renderers/footnote-citation';
import PlainText from '../components/content-renderers/plain-text';
import Fallback from '../components/node-renderers/fallback';
import caption from '../components/node-renderers/caption';
import heading from '../components/node-renderers/heading';
import list from '../components/node-renderers/list';
import listitem from '../components/node-renderers/list-item';
import math from '../components/node-renderers/math';
import Noop from '../components/node-renderers/noop';
import para from '../components/node-renderers/para';
import policy from '../components/node-renderers/policy';
import sec from '../components/node-renderers/sec';
import table from '../components/node-renderers/table';
import tbody from '../components/node-renderers/tbody';
import thead from '../components/node-renderers/thead';
import td from '../components/node-renderers/td';
import tr from '../components/node-renderers/tr';
import th from '../components/node-renderers/th';


const nodeMapping = {
  caption,
  footnote: Noop,
  heading,
  list,
  listitem,
  math,
  para,
  policy,
  preamble: Noop,
  sec,
  table,
  tbody,
  td,
  thead,
  tr,
  th,
};
const contentMapping = {
  footnote_citation: FootnoteCitation,
};

/* Looks up the React Component for each element in the contents field and
 * renders it */
export function renderContent(contents) {
  return contents.map((content, idx) => {
    const ContentComponent = contentMapping[content.content_type] || PlainText;
    // We're guaranteed these have a consistent order
    /* eslint-disable react/no-array-index-key */
    return <ContentComponent content={content} key={idx} />;
    /* eslint-enable react/no-array-index-key */
  });
}

/* Looks up the React Component for this type of docNode and renders it */
export default function renderNode(docNode) {
  const NodeComponent = nodeMapping[docNode.node_type] || Fallback;
  const props = { docNode, key: docNode.identifier };
  return (
    <NodeComponent {...props}>
      { renderContent(docNode.content) }
    </NodeComponent>
  );
}
