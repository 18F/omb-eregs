import axios from 'axios';
import { Node } from 'prosemirror-model';

import schema from './schema';

export function convertNode(node) {
  const nodeType = node.node_type in NODE_TYPE_CONVERTERS ?
    node.node_type : 'unimplemented_node';
  return NODE_TYPE_CONVERTERS[nodeType](node);
}

const NODE_TYPE_CONVERTERS = {
  unimplemented_node: node => ({
    type: 'unimplemented_node',
    attrs: { data: JSON.stringify(node) },
    content: [{
      type: 'text',
      text: node.node_type || '[no-node-type]',
    }],
  }),
  policy: node => ({
    type: 'doc',
    content: (node.children || []).map(convertNode),
  }),
};

export default function fetchDoc(path?: string) {
  const pathParts = (path || window.location.href).split('/');
  const policyId = pathParts[pathParts.length - 1];
  return axios.get(`/document/${policyId}`)
    .then(response => Node.fromJSON(schema, convertNode(response.data)));
}

