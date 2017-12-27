import {Node} from "prosemirror-model";

import schema from './policy-schema';

let warnings_logged = {};

function logWarningOnce(msg) {
  if (msg in warnings_logged) {
    return;
  }
  warnings_logged[msg] = true;
  console.warn(msg);
}

function convertChild(node) {
  if (node.node_type) {
    if (node.node_type in NODE_TYPE_CONVERTERS) {
      return NODE_TYPE_CONVERTERS[node.node_type](node);
    }
    logWarningOnce(`Unknown node_type: ${node.node_type}`);
    return {
      type: 'unimplemented_child',
      attrs: {data: JSON.stringify(node)},
      content: [{type: 'text', text: node.node_type}],
    };
  }
}

function convertContent(node) {
  if (node.content_type) {
    if (node.content_type in CONTENT_TYPE_CONVERTERS) {
      return CONTENT_TYPE_CONVERTERS[node.content_type](node);
    }

    logWarningOnce(`Unknown content_type: ${node.content_type}`);
    return {
      type: 'unimplemented_content',
      attrs: {
        data: JSON.stringify(node),
        contentType: node.content_type,
      }
    };
  }
}

function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

function flatMap(array, fn) {
  return array.reduce((all, curr) => all.concat(toArray(fn(curr))), []);
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ');
}

const NODE_TYPE_CONVERTERS = {
  heading(node) {
    return {
      type: 'heading',
      content: flatMap(node.content, convertContent),
    };
  },
  para(node) {
    return [{
      type: 'paragraph',
      content: flatMap(node.content, convertContent),
    }].concat(flatMap(node.children, convertChild));
  },
  sec(node) {
    return {
      type: 'section',
      content: flatMap(node.children, convertChild),
    };
  },
  footnote(node) {
    return {
      type: 'footnote',
      attrs: {
        marker: node.marker,
      },
      content: flatMap(node.content, convertContent),
    };
  },
};

const CONTENT_TYPE_CONVERTERS = {
  __text__(node) {
    return {
      type: 'text',
      text: collapseWhitespace(node.text),
    };
  },
  external_link(node) {
    return {
      type: 'text',
      text: collapseWhitespace(node.text),
      marks: [{
        type: 'external_link',
        attrs: {
          href: node.href,
        },
      }],
    };
  },
  footnote_citation(node) {
    return {
      type: 'text',
      text: node.text,
      marks: [{
        type: 'footnote_citation',
      }],
    };
  },
};

export default function dbDocToProseMirrorDoc(root) {
  warnings_logged = {};

  const doc = Node.fromJSON(schema, {
    type: 'doc',
    content: flatMap(
      root.children.filter(child => child.node_type !== 'preamble'),
      convertChild
    ),
  });

  doc.check();

  return doc;
}
