import axios from 'axios';
import { flatten } from 'lodash/array';
import { Mark, Node } from 'prosemirror-model';

import schema from './schema';

export default function parseDoc(node): Node {
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplemented_node';
  return NODE_TYPE_CONVERTERS[nodeType](node);
}

export function convertContent(content, marks: Mark[]): Node[] {
  if (content.content_type === '__text__') {
    const text = (content.text || '').replace(/\s+/g, ' ');
    return [schema.text(text, marks)];
  }
  const contentType = content.content_type in CONTENT_TYPE_CONVERTERS ?
    content.content_type : 'unimplemented_mark';
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
    return schema.nodes.heading.create({ depth }, schema.text(text));
  },
  para(node) {
    const nested: Node[][] = (node.content || []).map(c => convertContent(c, []));
    const inlineContent = schema.nodes.inline.create({}, flatten(nested));
    const childContent = (node.children || []).map(parseDoc);
    return schema.nodes.para.create({}, [inlineContent].concat(childContent));
  },
  policy: node =>
    schema.nodes.policy.create({}, (node.children || []).map(parseDoc)),
  sec: node =>
    schema.nodes.sec.create({}, (node.children || []).map(parseDoc)),
  unimplemented_node: node =>
    schema.nodes.unimplemented_node.create({ data: node }),
};

const CONTENT_TYPE_CONVERTERS = {
  unimplemented_mark: content =>
    schema.marks.unimplemented_mark.create({ data: content }),
};