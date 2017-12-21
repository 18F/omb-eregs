// This is largely taken from: https://prosemirror.net/examples/basic/

import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {Schema, Node} from "prosemirror-model";
import {schema} from "prosemirror-schema-basic";
import {addListNodes} from "prosemirror-schema-list";
import {exampleSetup} from "prosemirror-example-setup";

import styles from 'prosemirror-view/style/prosemirror.css';
import styles from 'prosemirror-gapcursor/style/gapcursor.css';
import styles from 'prosemirror-menu/style/menu.css';
import styles from 'prosemirror-example-setup/style/style.css';

function addSectionNodes(nodes) {
  return nodes.append({
    section: {
      content: 'block+',
      parseDOM: [{tag: 'div'}],
      toDOM() { return ["div", 0]; },
    }
  });
}

function dbDocToProseMirrorDoc(root, schema) {
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

function proseMirrorDocToDbDoc(doc) {
  // TODO implement this!
}

const mySchema = new Schema({
  nodes: addSectionNodes(
    addListNodes(schema.spec.nodes, "paragraph block", "block")
  ),
  marks: schema.spec.marks,
});

const contentEl = document.querySelector('#content');

window.fetch('/document/M-14-10')
  .then(res => res.json())
  .then(dbDoc => dbDocToProseMirrorDoc(dbDoc, mySchema))
  .then(doc => {
    window.view = new EditorView(document.querySelector('#editor'), {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({schema: mySchema}),
      }),
    });
  });
