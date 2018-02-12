import { EditorView } from 'prosemirror-view';

import Api from './Api';
import createEditorState from './create-editor-state';
import { getEl, getElAttr } from './util';

const EDITOR_SEL = '#editor';
const DOC_URL_ATTR = 'data-document-url';

window.addEventListener('load', () => {
  const api = new Api({
    contentType: 'json',
    csrfToken: getElAttr('[name=csrfmiddlewaretoken]', 'value'),
    url: getElAttr(EDITOR_SEL, DOC_URL_ATTR),
  });

  api.fetch().then((data) => {
    const state = createEditorState(data, api);
    new EditorView(getEl(EDITOR_SEL), { state });
  });
});
