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
}

interface ApiTypeMap {
  'json': ApiNode;
  'akn+xml': string;
}

interface ApiOptions<T extends keyof ApiTypeMap> {
  contentType: T;
  csrfToken: string;
  url: string;
}

export default class Api<T extends keyof ApiTypeMap> {
  url: string;
  contentType: string;
  csrfToken: string;

  constructor(options: ApiOptions<T>) {
    this.url = options.url;
    this.contentType = `application/${options.contentType}`;
    this.csrfToken = options.csrfToken;
  }

  async fetch(): Promise<ApiTypeMap[T]> {
    try {
      setStatus('Loading document...');
      const response = await axios.get(this.url, { headers: {
        Accept: this.contentType,
      } });
      setStatus('Document loaded.');
      return response.data as ApiTypeMap[T];
    } catch (e) {
      setStatusError(e);
      throw e;
    }
  }

  async write(data: ApiTypeMap[T]): Promise<void> {
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
