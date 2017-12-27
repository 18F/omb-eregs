import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {keymap} from "prosemirror-keymap"
import {baseKeymap, selectParentNode} from "prosemirror-commands";
import {history, undo, redo} from "prosemirror-history";
import {menuBar, undoItem, redoItem,
        selectParentNodeItem} from "prosemirror-menu";
import {splitListItem} from "prosemirror-schema-list";

import convertDoc from './convert-doc';
import runTests from './test';
import schema from './policy-schema';

import styles from 'prosemirror-view/style/prosemirror.css';
import styles from 'prosemirror-menu/style/menu.css';


const contentEl = document.querySelector('#content');

window.fetch('/document/M-16-19')
  .then(res => res.json())
  .then(dbDoc => {
    const doc = convertDoc(dbDoc);

    window.view = new EditorView(document.querySelector('#editor'), {
      state: EditorState.create({
        doc,
        plugins: [
          menuBar({
            floating: true,
            content: [[undoItem, redoItem], [selectParentNodeItem]],
          }),
          keymap(Object.assign({}, baseKeymap, {
            'Mod-z': undo,
            'Shift-Mod-z': redo,
            'Escape': selectParentNode,
            'Shift-Enter': splitListItem(schema.nodes.list_item),
          })),
          history(),
        ],
      }),
    });
  });

window.addEventListener('load', runTests);
