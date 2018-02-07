import axios from 'axios';
import { flatten } from 'lodash/array';
import { Mark, Node } from 'prosemirror-model';

import schema, { factory } from './schema';

export default function parseDoc(node): Node {
  console.log(node.node_type);
  if (node.node_type.indexOf('external') !== -1) {
      console.log(node.node_type);
  }
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplementedNode';
  return NODE_TYPE_CONVERTERS[nodeType](node);
}

export function convertContent(content, marks: Mark[]): Node[] {
  if (content.content_type === '__text__') {
    const text = (content.text || '').replace(/\s+/g, ' ');
    return [schema.text(text, marks)];
  }
  console.log(content.content_type);
  const contentType = content.content_type in CONTENT_TYPE_CONVERTERS ?
    content.content_type : 'unimplementedMark';
  const mark = CONTENT_TYPE_CONVERTERS[contentType](content);
  const updatedMarks = marks.concat([mark]);
  const nestedChildNodes = (content.inlines || []).map(child =>
    convertContent(child, updatedMarks));
  return flatten(nestedChildNodes);
}

const NODE_TYPE_CONVERTERS = {
  heading(node) {
    // Duplicates logic in `ui`
    const depth = node.identifier
      .split('_')
      .filter(e => e === 'sec')
      .length + 1;
    const text = (node.text || '').replace(/\s+/g, ' ');
    return factory.heading(text, depth);
  },
  list: node => factory.list((node.children || []).map(parseDoc)),
  listitem: node => factory.listitem(node.marker, (node.children || []).map(parseDoc)),
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
