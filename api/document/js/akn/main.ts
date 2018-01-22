import axios from 'axios';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/dialog/dialog.js';

import { getEl, getElAttr } from '../util';


// We need to load our CSS via require() rather than import;
// using the latter raises errors about not being able to find
// the module.
declare function require(path: string): null;

require('codemirror/lib/codemirror.css');
require('codemirror/theme/eclipse.css');
require('codemirror/addon/dialog/dialog.css');

const EDITOR_SEL = '#editor';
const DOC_URL_ATTR = 'data-document-url';
const AKN_CONTENT_TYPE = 'application/akn+xml';

function fetchDoc() {
  return axios({
    method: 'GET',
    url: getElAttr(EDITOR_SEL, DOC_URL_ATTR),
    headers: { Accept: AKN_CONTENT_TYPE },
  }).then(response => response.data);
}

function saveDoc(data: string) {
  return axios({
    data,
    method: 'put',
    url: getElAttr(EDITOR_SEL, DOC_URL_ATTR),
    headers: {
      'Content-Type': AKN_CONTENT_TYPE,
      'X-CSRFToken': getElAttr('[name=csrfmiddlewaretoken]', 'value'),
    },
  });
}

function setStatusError(e: Error) {
  let errMsg = `An error occurred: ${e}`;
  const data = e['response'] && e['response']['data'];
  if (data) {
    errMsg += '\n' + JSON.stringify(data, null, 2);
  }
  setStatus(errMsg, 'error');
}

function setStatus(msg: string, className: 'error'|'' = '') {
  const status = getEl('#status');
  status.textContent = msg;
  status.className = className;
}

function createEditor(value: string) {
  const cm = CodeMirror(getEl(EDITOR_SEL), {
    value,
    lineNumbers: true,
    mode: 'xml',
    theme: 'eclipse',
  });

  CodeMirror['commands'].save = (cm) => {
    setStatus('Saving...');
    saveDoc(cm.getValue()).then((_) => {
      setStatus(`Document saved at ${new Date()}.`);
    }).catch(setStatusError);
  };
}

window.addEventListener('load', () => {
  setStatus('Loading document...');
  fetchDoc().then((value) => {
    setStatus('Document loaded.');
    createEditor(value);
  }).catch(setStatusError);
});
