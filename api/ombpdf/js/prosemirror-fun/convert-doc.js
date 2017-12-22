import {Node} from "prosemirror-model";

import schema from './policy-schema';

function convertChild(node) {
  if (node.node_type) {
    if (node.node_type in NODE_TYPE_CONVERTERS) {
      return NODE_TYPE_CONVERTERS[node.node_type](node);
    }
    console.warn(`Unknown node type: ${node.node_type}`);
    return {
      type: 'text',
      text: node.node_type,
      marks: [{type: 'unimplemented',
               attrs: {data: JSON.stringify(node)}}],
    };
  }
}

function convertContent(node) {
  if (node.content_type) {
    if (node.content_type in CONTENT_TYPE_CONVERTERS) {
      return CONTENT_TYPE_CONVERTERS[node.content_type](node);
    }

    console.warn(`Unknown content type: ${node.content_type}`);
    return {
      type: 'text',
      text: node.content_type,
      marks: [{type: 'unimplemented',
               attrs: {data: JSON.stringify(node)}}],
    };
  }
}

function convertContentsAndChildren(node) {
  const contents = node.content.map(convertContent);
  const children = node.children.map(convertChild);
  return contents.concat(children);
};

const NODE_TYPE_CONVERTERS = {
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

const CONTENT_TYPE_CONVERTERS = {
  __text__(node) {
    return {
      type: 'text',
      text: node.text.replace(/\s+/g, ' '),
    };
  }
};

export default function dbDocToProseMirrorDoc(root) {
  const doc = Node.fromJSON(schema, {
    type: 'doc',
    content: root.children
      .filter(child => child.node_type !== 'preamble')
      .map(convertChild),
  });

  doc.check();

  return Promise.resolve(doc);
}
