import axios from 'axios';

import { getEl } from './util';
import { makeErrorFriendly } from './friendly-error';

function setStatus(msg: string, className: 'editor-status-error'|'' = '') {
  const status = getEl('#status');
  status.textContent = msg;
  status.className = `editor-status ${className}`;
}

export function setStatusError(e: Error) {
  let errMsg = 'An error occurred.';
  const data = e['response'] && e['response']['data'];
  if (data) {
    errMsg += '\n' + makeErrorFriendly(data);
  } else {
    console.error(e);
  }
  setStatus(errMsg, 'editor-status-error');
}

export interface ApiNode {
  children: ApiNode[];
  content: ApiContent[];
  marker?: string;
  node_type: string;
  type_emblem?: string;
  title?: string;
  identifier?: string;
  text?: string;
}

export interface ApiContent {
  content_type: string;
  inlines: ApiContent[];
  text: string;
  footnote_node?: ApiNode;
}

export class Api<T> {
  url: string;
  contentType: string;
  csrfToken: string;

  constructor({ contentType, csrfToken, url }) {
    this.url = url;
    this.contentType = contentType;
    this.csrfToken = csrfToken;
  }

  async fetch(): Promise<T> {
    try {
      setStatus('Loading document...');
      const response = await axios.get(this.url, { headers: {
        Accept: this.contentType,
      } });
      setStatus('Document loaded.');
      return response.data as T;
    } catch (e) {
      setStatusError(e);
      throw e;
    }
  }

  async write(data: T): Promise<void> {
    try {
      setStatus('Saving...');
      await axios.put(this.url, data, { headers: {
        'Content-Type': this.contentType,
        'X-CSRFToken': this.csrfToken,
      } });
      setStatus(`Document saved at ${new Date()}.`);
    } catch (e) {
      setStatusError(e);
      throw e;
    }
  }
}

export class JsonApi extends Api<ApiNode> {
  constructor({ csrfToken, url }) {
    super({ csrfToken, url, contentType: 'application/json' });
  }  
}

export class AknXmlApi extends Api<string> {
  constructor({ csrfToken, url }) {
    super({ csrfToken, url, contentType: 'application/akn+xml' });
  }
}
