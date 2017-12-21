import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {keymap} from "prosemirror-keymap"
import {history, undo, redo} from "prosemirror-history";
import {menuBar, undoItem, redoItem} from "prosemirror-menu";

import convertDoc from './convert-doc';

import styles from 'prosemirror-view/style/prosemirror.css';
import styles from 'prosemirror-menu/style/menu.css';


const contentEl = document.querySelector('#content');

window.fetch('/document/M-14-10')
  .then(res => res.json())
  .then(dbDoc => convertDoc(dbDoc))
  .then(doc => {
    window.view = new EditorView(document.querySelector('#editor'), {
      state: EditorState.create({
        doc,
        plugins: [
          menuBar({
            floating: true,
            content: [[undoItem, redoItem]],
          }),
          keymap({
            'Mod-z': undo,
            'Shift-Mod-z': redo,
          }),
          history(),
        ],
      }),
    });
  });
