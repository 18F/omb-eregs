import axios from 'axios';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/dialog/dialog.js';

import Api from '../Api';
import { getEl, getElAttr } from '../util';

const EDITOR_SEL = '#editor';
const DOC_URL_ATTR = 'data-document-url';

function createEditor(value: string, api: Api<'akn+xml'>) {
  const cm = CodeMirror(getEl(EDITOR_SEL), {
    value,
    lineNumbers: true,
    mode: 'xml',
    theme: 'eclipse',
  });

  CodeMirror['commands'].save = cm => api.write(cm.getValue());
}

window.addEventListener('load', () => {
  const api = new Api({
    contentType: 'akn+xml',
    csrfToken: getElAttr('[name=csrfmiddlewaretoken]', 'value'),
    url: getElAttr(EDITOR_SEL, DOC_URL_ATTR),
  });

  api.fetch().then(data => createEditor(data, api));
});
