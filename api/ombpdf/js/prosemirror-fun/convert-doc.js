import {Node} from "prosemirror-model";

import schema from './policy-schema';
import {toArray, flatMap} from './util';

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

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ');
}

function createListNode(marker) {
  if (marker === '●') {
    return {type: 'bullet_list'};
  } else if (marker === '1.') {
    return {
      type: 'ordered_list',
      attrs: {
        className: 'list-type-numbered',
      },
    };
  } else if (marker === 'a.') {
    return {
      type: 'ordered_list',
      attrs: {
        className: 'list-type-lettered',
      },
    };
  }
  throw new Error(`unrecognized marker for listitem: ` +
                  `${marker}`);
}

const NODE_TYPE_CONVERTERS = {
  heading(node) {
    return {
      type: 'heading',
      content: flatMap(node.content, convertContent),
    };
  },
  list(node) {
    const firstItem = node.children[0];
    if (firstItem.node_type !== 'listitem') {
      throw new Error(`expected first child of list to be `
                      `listitem, not ${firstItem.node_type}`);
    }
    return Object.assign(createListNode(firstItem.marker), {
      content: flatMap(node.children, convertChild),
    });
  },
  listitem(node) {
    return {
      type: 'list_item',
      content: flatMap(node.children, convertChild),
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
