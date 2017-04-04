import axios from 'axios';

import config from './config';

export class Endpoint {
  constructor(endpoint) {
    this.client = axios.create({ baseURL: config.apiRoot });
    this.endpoint = endpoint;
  }

  fetch(params = {}) {
    const query = this.client.get(this.endpoint, { params });
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

export default {
  keywords: new Endpoint('keywords/'),
  policies: new Endpoint('policies/'),
  requirements: new Endpoint('requirements/'),
};
