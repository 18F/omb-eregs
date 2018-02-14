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

export function convertContent(content, marks: Mark[]): Node[] {
  if (content.content_type === '__text__') {
    const text = (content.text || '').replace(/\s+/g, ' ');
    return [schema.text(text, marks)];
  }
  const contentType = content.content_type in CONTENT_TYPE_CONVERTERS ?
    content.content_type : 'unimplementedMark';
  const mark = CONTENT_TYPE_CONVERTERS[contentType](content);
  const updatedMarks = marks.concat([mark]);
  const nestedChildNodes = (content.inlines || []).map(child =>
    convertContent(child, updatedMarks));
  return flatten(nestedChildNodes);
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
      (node.children || []).map(parseDoc),
    );
  },
  listitem(node) {
    if (!node.marker)
      throw new Error('Assertion failure, list items must have markers');
    return factory.listitem(node.marker, (node.children || []).map(parseDoc));
  },
  para(node) {
    const nested: Node[][] = (node.content || []).map(c => convertContent(c, []));
    return factory.para(flatten(nested), (node.children || []).map(parseDoc));
  },
  policy: node => factory.policy((node.children || []).map(parseDoc)),
  sec: node => factory.sec((node.children || []).map(parseDoc)),
  unimplementedNode: node => factory.unimplementedNode(node),
};

const CONTENT_TYPE_CONVERTERS = {
  unimplementedMark: content => factory.unimplementedMark(content),
  external_link: content => factory.external_link(content.href),
};
