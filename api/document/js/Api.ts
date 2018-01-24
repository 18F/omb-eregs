import axios from 'axios';

import { getEl } from './util';

function setStatus(msg: string, className: 'editor-status-error'|'' = '') {
  const status = getEl('#status');
  status.textContent = msg;
  status.className = className;
}

function setStatusError(e: Error) {
  let errMsg = `An error occurred: ${e}`;
  const data = e['response'] && e['response']['data'];
  if (data) {
    errMsg += '\n' + JSON.stringify(data, null, 2);
  }
  setStatus(errMsg, 'editor-status-error');
}

export default class Api {
  url: string;
  contentType: string;
  csrfToken: string;

  constructor({ contentType, csrfToken, url }) {
    this.url = url;
    this.contentType = contentType;
    this.csrfToken = csrfToken;
  }

  async fetch() {
    try {
      setStatus('Loading document...');
      const response = await axios.get(this.url, { headers: {
        Accept: this.contentType,
      } });
      setStatus('Document loaded.');
      return response.data;
    } catch (e) {
      setStatusError(e);
    }
  }

  async write(data) {
    try {
      setStatus('Saving...');
      await axios.put(this.url, data, { headers: {
        'Content-Type': this.contentType,
        'X-CSRFToken': this.csrfToken,
      } });
      setStatus(`Document saved at ${new Date()}.`);
    } catch (e) {
      setStatusError(e);
    }
  }
}
