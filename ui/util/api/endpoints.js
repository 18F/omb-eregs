import axios from 'axios';
import buildURL from 'axios/lib/helpers/buildURL';
import LRU from 'lru-cache';

const CACHE_MAX_AGE = (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'test'
) ? 1000 * 60 * 60 /* 1 hour */ : 1;

const CACHE_CONFIG = {
  max: 32,
  maxAge: CACHE_MAX_AGE,
};

export class Endpoint {
  constructor(endpoint) {
    this.client = axios.create({ baseURL: process.env.API_URL });
    this.endpoint = endpoint;
    this.cache = LRU(CACHE_CONFIG);
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

  async fetchOne(id) {
    const key = `fetchOne${id}`;
    const cacheVal = this.cache.get(key);
    if (cacheVal) {
      return cacheVal;
    }

    const { data } = await this.client.get(`${this.endpoint}${id}/`);
    this.cache.set(key, data);
    return data;
  }
}

export default {
  agencies: new Endpoint('agencies/'),
  document: new Endpoint('document/'),
  policies: new Endpoint('policies/'),
  requirements: new Endpoint('requirements/'),
  topics: new Endpoint('topics/'),
};
