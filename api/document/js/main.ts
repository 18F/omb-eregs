import { EditorView } from 'prosemirror-view';

import { getEl } from './util';
import createEditorState from './create-editor-state';
import fetchDoc from './fetch-doc';

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

require('prosemirror-view/style/prosemirror.css');
require('prosemirror-menu/style/menu.css');

const EDITOR_SEL = '#editor';

window.addEventListener('load', async () => {
  const doc = await fetchDoc();
  new EditorView(getEl(EDITOR_SEL), {
    state: createEditorState(doc),
  });
});
