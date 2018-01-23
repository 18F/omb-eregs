import { EditorView } from 'prosemirror-view';

import { getEl, getElAttr } from './util';
import createEditorState from './create-editor-state';
import fetchDoc from './fetch-doc';

const EDITOR_SEL = '#editor';

window.addEventListener('load', async () => {
  const doc = await fetchDoc(getElAttr(EDITOR_SEL, 'data-document-url'));
  new EditorView(getEl(EDITOR_SEL), {
    state: createEditorState(doc),
  });
});
