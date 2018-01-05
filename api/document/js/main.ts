import {Schema, Node} from "prosemirror-model";
import {EditorView} from "prosemirror-view";
import {EditorState} from "prosemirror-state";
import {menuBar, undoItem, redoItem, MenuItem} from "prosemirror-menu";
import {history, undo, redo} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import {baseKeymap} from "prosemirror-commands";

declare function require(path: string): null;

require("prosemirror-view/style/prosemirror.css");
require("prosemirror-menu/style/menu.css");

const EDITOR_ID = 'editor';

const EXAMPLE_DOC = {
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{
      type: 'text',
      text: 'Hello, I am a paragraph.',
    }],
  }],
};

const schema = new Schema({
  nodes: {
    doc: {
      content: 'paragraph+',
    },
    paragraph: {
      content: 'inline*',
      toDOM() { return ['p', 0]; },
    },
    text: {
      group: 'inline',
    },
  },
  marks: {},
});

function getDocument(): Node {
  const doc = Node.fromJSON(schema, EXAMPLE_DOC);

  doc.check();

  return doc;
}

function getEl(id: string): Element {
  const el = document.getElementById(id);
  if (!el)
    throw new Error(`element with id '${id}' not found`);
  return el;
}

const view = new EditorView(getEl(EDITOR_ID), {
  state: EditorState.create({
    doc: getDocument(),
    plugins: [
      menuBar({
        floating: true,
        content: [
          [
            // This forcible type assertion is due to what appears to
            // be a bug in the documentation/type annotations for
            // prosemirror-menu. For more details, see:
            //
            // https://github.com/ProseMirror/prosemirror-menu/issues/12
            undoItem as any as MenuItem,
            redoItem as any as MenuItem,
          ]
        ],
      }),
      keymap(Object.assign({}, baseKeymap, {
        'Mod-z': undo,
        'Shift-Mod-z': redo,
      })),
      history(),
    ],
  })
});
