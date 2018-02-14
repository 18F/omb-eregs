import { EditorView } from 'prosemirror-view';

import { JsonApi } from './Api';
import createEditorState from './create-editor-state';
import { getEl, getElAttr } from './util';
import * as footnoteMunging from './footnote-munging';

const EDITOR_SEL = '#editor';
const DOC_URL_ATTR = 'data-document-url';

window.addEventListener('load', () => {
  const api = new JsonApi({
    csrfToken: getElAttr('[name=csrfmiddlewaretoken]', 'value'),
    url: getElAttr(EDITOR_SEL, DOC_URL_ATTR),
  });

  api.fetch().then((data) => {
    const mungedData = footnoteMunging.mungeApiNode(data);
    const state = createEditorState(mungedData, api);
    new EditorView(getEl(EDITOR_SEL), { state });
  });
});
