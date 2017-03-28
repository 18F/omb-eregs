import axios from 'axios';

export class Endpoint {
  constructor(baseUrl, endpoint) {
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
  }

  fetch(params = {}) {
    const query = axios.get(`${this.baseUrl}${this.endpoint}/`, { params });
    return query.then(({ data }) => data);
  }

  fetchResults(params = {}) {
    return this.fetch(params).then(data => data.results);
  }

  withIds(idString) {
    if (idString) {
      return this.fetchResults({ id__in: idString });
    }
    return Promise.resolve([]);
  }
}

export default function makeApi(baseUrl) {
  return {
    keywords: new Endpoint(baseUrl, 'keywords'),
    policies: new Endpoint(baseUrl, 'policies'),
    requirements: new Endpoint(baseUrl, 'requirements'),
  };
}
