import axios from 'axios';

import schema from './schema';

export function convertNode(node) {
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplemented_node';
  return NODE_TYPE_CONVERTERS[nodeType](node);
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
    const text = (node.text || '').replace(/\s+/g, ' ');
    const inlineContent = schema.nodes.inline.create({}, schema.text(text));
    const childContent = (node.children || []).map(convertNode);
    return schema.nodes.para.create({}, [inlineContent].concat(childContent));
  },
  policy: node =>
    schema.nodes.doc.create({}, (node.children || []).map(convertNode)),
  sec: node =>
    schema.nodes.sec.create({}, (node.children || []).map(convertNode)),
  unimplemented_node: node =>
    schema.nodes.unimplemented_node.create({ data: node }),
};

export default function fetchDoc(path?: string) {
  const pathParts = (path || window.location.href).split('/');
  const policyId = pathParts[pathParts.length - 1];
  return axios.get(`/document/${policyId}`)
    .then(response => convertNode(response.data));
}

