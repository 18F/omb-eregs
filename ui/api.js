import axios from 'axios';
import buildURL from 'axios/lib/helpers/buildURL';
import LRU from 'lru-cache';

import config from './config';

export class Endpoint {
  constructor(endpoint) {
    this.client = axios.create({ baseURL: config.apiRoot });
    this.endpoint = endpoint;
    this.cache = LRU(config.cacheConfig);
  }

  fetch(params = {}) {
    const key = buildURL('', params);
    const cacheVal = this.cache.get(key);
    if (cacheVal) {
      return Promise.resolve(cacheVal);
    }

    const query = this.client.get(this.endpoint, { params });
    return query.then(({ data }) => {
      this.cache.set(key, data);
      return data;
    });
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
  topics: new Endpoint('topics/'),
  policies: new Endpoint('policies/'),
  requirements: new Endpoint('requirements/'),
};
