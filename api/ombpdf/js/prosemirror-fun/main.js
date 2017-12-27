import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {keymap} from "prosemirror-keymap"
import {history, undo, redo} from "prosemirror-history";
import {menuBar, undoItem, redoItem,
        selectParentNodeItem} from "prosemirror-menu";

import convertDoc from './convert-doc';
import runTests from './test';
import {UnimplementedContentView} from './node-views';

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
          keymap({
            'Mod-z': undo,
            'Shift-Mod-z': redo,
          }),
          history(),
        ],
      }),
      nodeViews: {
        unimplemented_content(node) {
          return new UnimplementedContentView(node);
        },
      },
    });
  });

window.addEventListener('load', runTests);
