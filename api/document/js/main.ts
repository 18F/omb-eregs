import {Schema, Node} from "prosemirror-model";
import {EditorView} from "prosemirror-view";
import {EditorState} from "prosemirror-state";
import {menuBar, undoItem, redoItem, MenuItem} from "prosemirror-menu";
import {history, undo, redo} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import {baseKeymap} from "prosemirror-commands";

// We need to load our CSS via require() rather than import;
// using the latter raises errors about not being able to find
// the module.
//
// I *suspect* it is because ts-loader (the TypeScript plugin for
// webpack) probably loads import statements on its own,
// without going through webpack, and it doesn't know what to
// do with non-standard kinds of imports like CSS, so using require()
// likely bypasses TypeScript and goes straight to webpack, which
// deals with it correctly. I could be wrong, though. -AV
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

  // This validates the document structure against our schema, which
  // is useful as a sanity check. However, in production we may want
  // to catch any exceptions and log an error, rather than crashing
  // the whole front-end.
  doc.check();

  return doc;
}

function getEl(id: string): Element {
  const el = document.getElementById(id);
  if (!el)
    throw new Error(`element with id '${id}' not found`);
  return el;
}

window.addEventListener('load', () => {
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
        keymap({
          ...baseKeymap,
          'Mod-z': undo,
          'Shift-Mod-z': redo,
        }),
        history(),
      ],
    })
  });
});
