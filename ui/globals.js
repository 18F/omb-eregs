let staticApiUrl = null;

export function setApiUrl(value) {
  staticApiUrl = value;
}

export function apiUrl() {
  if (staticApiUrl) {
    return staticApiUrl;
  }
  throw new Error('API Url not set');
}
