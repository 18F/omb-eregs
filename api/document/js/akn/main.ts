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
const AKN_CONTENT_TYPE = 'application/akn+xml';

function createEditor(value: string, api: Api) {
  const cm = CodeMirror(getEl(EDITOR_SEL), {
    value,
    lineNumbers: true,
    mode: 'xml',
    theme: 'eclipse',
  });

  CodeMirror['commands'].save = cm => api.write(cm.getValue());
}

window.addEventListener('load', () => {
  const api = new Api(
    getElAttr(EDITOR_SEL, DOC_URL_ATTR),
    AKN_CONTENT_TYPE,
    getElAttr('[name=csrfmiddlewaretoken]', 'value'),
  );

  api.fetch().then(data => createEditor(data, api));
});
