import { EditorView } from 'prosemirror-view';

import Api from './Api';
import createEditorState from './create-editor-state';
import { getEl, getElAttr } from './util';

const EDITOR_SEL = '#editor';
const DOC_URL_ATTR = 'data-document-url';

window.addEventListener('load', () => {
  const api = new Api(
    getElAttr(EDITOR_SEL, DOC_URL_ATTR),
    'application/json',
    getElAttr('[name=csrfmiddlewaretoken]', 'value'),
  );

  api.fetch().then((data) => {
    const state = createEditorState(data, api);
    new EditorView(getEl(EDITOR_SEL), { state });
  });
});
