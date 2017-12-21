import {Node} from "prosemirror-model";

import schema from './policy-schema';


export default function dbDocToProseMirrorDoc(root) {
  const convert = node => {
    if (node.node_type) {
      if (node.node_type in node_type_converters) {
        return node_type_converters[node.node_type](node);
      }
      throw new Error(`Unknown node type: ${node.node_type}`);
    }
    if (node.content_type) {
      if (node.content_type in content_type_converters) {
        return content_type_converters[node.content_type](node);
      }
      throw new Error(`Unknown content type: ${node.content_type}`);
    }
    throw new Error(`Don't know what to do with node: ` +
                    `${JSON.stringify(node)}`);
  };

  const node_type_converters = {
    policy(node) {
      return {
        type: 'doc',
        content: node.children.map(convert),
      };
    },
    para(node) {
      return {
        type: 'paragraph',
        content: node.content.map(convert),
      };
    },
    sec(node) {
      return {
        type: 'section',
        content: node.children.map(convert),
      };
    },
  };

  const content_type_converters = {
    __text__(node) {
      return {
        type: 'text',
        text: node.text,
      };
    }
  };

  return Promise.resolve(Node.fromJSON(schema, convert(root)));
}
