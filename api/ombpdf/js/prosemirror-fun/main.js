import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";

import {exampleSetup} from "prosemirror-example-setup";

import convertDoc from './convert-doc';
import policySchema from './policy-schema';

import styles from 'prosemirror-view/style/prosemirror.css';
import styles from 'prosemirror-gapcursor/style/gapcursor.css';
import styles from 'prosemirror-menu/style/menu.css';
import styles from 'prosemirror-example-setup/style/style.css';


const contentEl = document.querySelector('#content');

window.fetch('/document/M-14-10')
  .then(res => res.json())
  .then(dbDoc => convertDoc(dbDoc, policySchema))
  .then(doc => {
    window.view = new EditorView(document.querySelector('#editor'), {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({schema: policySchema}),
      }),
    });
  });
