import {Node} from "prosemirror-model";

import schema from './policy-schema';


export default function dbDocToProseMirrorDoc(root) {
  const convertChild = node => {
    if (node.node_type) {
      if (node.node_type in node_type_converters) {
        return node_type_converters[node.node_type](node);
      }
      console.warn(`Unknown node type: ${node.node_type}`);
      return {
        type: 'text',
        text: node.node_type,
        marks: [{type: 'unimplemented',
                 attrs: {data: JSON.stringify(node)}}],
      };
    }
  };

  const convertContent = node => {
    if (node.content_type) {
      if (node.content_type in content_type_converters) {
        return content_type_converters[node.content_type](node);
      }

      console.warn(`Unknown content type: ${node.content_type}`);
      return {
        type: 'text',
        text: node.content_type,
        marks: [{type: 'unimplemented',
                 attrs: {data: JSON.stringify(node)}}],
      };
    }
  };

  const convertContentsAndChildren = node => {
    const contents = node.content.map(convertContent);
    const children = node.children.map(convertChild);
    return contents.concat(children);
  };

  const node_type_converters = {
    heading(node) {
      return {
        type: 'heading',
        content: node.content.map(convertContent),
      };
    },
    para(node) {
      return {
        type: 'paragraph',
        content: convertContentsAndChildren(node),
      };
    },
    sec(node) {
      return {
        type: 'section',
        content: node.children.map(convertChild),
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

  return Promise.resolve(Node.fromJSON(schema, {
    type: 'doc',
    content: root.children.map(convertChild),
  }));
}
