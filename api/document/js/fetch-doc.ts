import axios from 'axios';

import schema from './schema';

export function convertNode(node) {
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplemented_node';
  return NODE_TYPE_CONVERTERS[nodeType](node);
}

const NODE_TYPE_CONVERTERS = {
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

