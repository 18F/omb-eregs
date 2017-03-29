import makeApi from './api';

let api = null;

export function setApiUrl(value) {
  api = makeApi(value);
}

export function theApi() {
  if (api) {
    return api;
  }
  throw new Error('API Url not set');
}
