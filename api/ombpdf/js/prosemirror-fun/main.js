// This is largely taken from: https://prosemirror.net/examples/basic/

import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {Schema, DOMParser} from "prosemirror-model";
import {schema} from "prosemirror-schema-basic";
import {addListNodes} from "prosemirror-schema-list";
import {exampleSetup} from "prosemirror-example-setup";

import styles from 'prosemirror-view/style/prosemirror.css';
import styles from 'prosemirror-gapcursor/style/gapcursor.css';
import styles from 'prosemirror-menu/style/menu.css';
import styles from 'prosemirror-example-setup/style/style.css';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block", "block"),
  marks: schema.spec.marks,
});

const contentEl = document.querySelector('#content');

window.view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(contentEl),
    plugins: exampleSetup({schema: mySchema}),
  }),
});
