import axios from 'axios';
import { flatten } from 'lodash/array';
import { Mark, Node } from 'prosemirror-model';

import { ApiNode, ApiContent } from './Api';
import schema, { factory } from './schema';

export default function parseDoc(node): Node {
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplementedNode';
  return NODE_TYPE_CONVERTERS[nodeType](node);
}

function convertFootnoteCitation(content: ApiContent): Node {
  const footnote = content.footnote_node;
  if (!footnote) {
    throw new Error('Assertion failure, footnote citation needs ' +
                    'footnote node');
  }
  const emblem = footnote.type_emblem;
  if (!emblem) {
    throw new Error('Assertion failure, footnote needs emblem');
  }
  const nested: Node[][] = (footnote.content || [])
    .map(c => convertContent(c, []));
  return factory.inlineFootnote(emblem, flatten(nested));
}

export function convertContent(content: ApiContent, marks: Mark[]): Node[] {
  if (content.content_type === '__text__') {
    const text = (content.text || '').replace(/\s+/g, ' ');
    return [schema.text(text, marks)];
  }
  if (content.content_type === 'footnote_citation') {
    return [convertFootnoteCitation(content)];
  }
  const contentType = content.content_type in CONTENT_TYPE_CONVERTERS ?
    content.content_type : 'unimplementedMark';
  const mark = CONTENT_TYPE_CONVERTERS[contentType](content);
  const updatedMarks = marks.concat([mark]);
  const nestedChildNodes = (content.inlines || []).map(child =>
    convertContent(child, updatedMarks));
  return flatten(nestedChildNodes);
}

function mapChildren(node: ApiNode): Node[] {
  return (node.children || []).filter((child) => {
    // We're going to strip out footnotes, as we're using the
    // footnote node embedded in the citation instead.
    return (child.node_type !== 'footnote');
  }).map(parseDoc);
}

type NodeConverterMap = {
  [nodeName: string]: (node: ApiNode) => Node,
};

const NODE_TYPE_CONVERTERS: NodeConverterMap = {
  heading(node) {
    if (!node.identifier)
      throw new Error('Assertion failure, node needs identifier');

    // Duplicates logic in `ui`
    const depth = node.identifier
      .split('_')
      .filter(e => e === 'sec')
      .length + 1;
    const text = (node.text || '').replace(/\s+/g, ' ');
    return factory.heading(text, depth);
  },
  list(node) {
    let startMarker = '●';
    if (node.children.length) {
      startMarker = node.children[0].marker || startMarker;
    }
    return factory.list(
      startMarker,
      mapChildren(node),
    );
  },
  listitem(node) {
    if (!node.marker)
      throw new Error('Assertion failure, list items must have markers');
    return factory.listitem(node.marker, mapChildren(node));
  },
  para(node) {
    const nested: Node[][] = (node.content || []).map(c => convertContent(c, []));
    return factory.para(flatten(nested), mapChildren(node));
  },
  // Note that we are not calling `mapChildren` here, as that function skips
  // footnotes. The PDF parser adds uncited footnotes as the direct children
  // of policy, so we want to keep them there to avoid data loss for now.
  //
  // For more details, see: https://github.com/18F/omb-eregs/issues/1028
  policy: node => factory.policy((node.children || []).map(parseDoc)),
  sec: node => factory.sec(mapChildren(node)),
  unimplementedNode: node => factory.unimplementedNode(node),
};

const CONTENT_TYPE_CONVERTERS = {
  unimplementedMark: content => factory.unimplementedMark(content),
};
