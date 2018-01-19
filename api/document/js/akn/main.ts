import axios from 'axios';
import * as CodeMirror from "codemirror";
import "codemirror/mode/xml/xml.js";
import "codemirror/addon/search/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/dialog/dialog.js";

import { getEl } from "../util";


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
declare function require(path: string): null;

require('codemirror/lib/codemirror.css');
require('codemirror/theme/eclipse.css');
require('codemirror/addon/dialog/dialog.css');

const EDITOR_SEL = '#editor';

function fetchDoc(path?: string) {
  const pathParts = (path || window.location.href).split('/');
  const policyId = pathParts[pathParts.length - 2];
  return axios.get(`/document/${policyId}?format=akn`)
    .then(response => response.data);
}

function saveDoc(data: string, path?: string) {
  const pathParts = (path || window.location.href).split('/');
  const policyId = pathParts[pathParts.length - 2];
  return axios({
    method: 'put',
    url: `/document/${policyId}`,
    data,
    headers: {
      'Content-Type': 'application/akn+xml',
      'X-CSRFToken': getEl('[name=csrfmiddlewaretoken]')
        .getAttribute('value'),
    },
  })
}

function setStatusError(e: Error) {
  let errMsg = `An error occurred: ${e}`;
  let data = e['response'] && e['response']['data'];
  if (data) {
    errMsg += '\n' + JSON.stringify(data, null, 2);
  }
  setStatus(errMsg, "error");
}

function setStatus(msg: string, className: "error"|"" = "") {
  let status = getEl("#status");
  status.textContent = msg;
  status.className = className;
}

function createEditor(value: string) {
  const cm = CodeMirror(getEl(EDITOR_SEL), {
    lineNumbers: true,
    mode: 'xml',
    theme: 'eclipse',
    value,
  });

  CodeMirror['commands'].save = cm => {
    setStatus("Saving...");
    saveDoc(cm.getValue()).then(_ => {
      setStatus(`Document saved at ${new Date()}.`);
    }).catch(setStatusError);
  };
}

window.addEventListener('load', () => {
  setStatus("Loading document...");
  fetchDoc().then(value => {
    setStatus("Document loaded.");
    createEditor(value);
  }).catch(setStatusError);
});
