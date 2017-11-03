import axios from 'axios';

import { Endpoint } from '../../../util/api/endpoints';

jest.mock('axios');

const ORIGINALENV = Object.assign({}, process.env);
beforeEach(() => {
  process.env = {};
});
afterEach(() => {
  process.env = ORIGINALENV;
});

function mockAxios(...resultSets) {
  const get = jest.fn();
  resultSets.forEach(results =>
    get.mockImplementationOnce(() => Promise.resolve({ data: { results } })),
  );
  axios.create.mockImplementationOnce(() => ({ get }));
  return get;
}

describe('Endpoint', () => {
  describe('withIds', () => {
    it('handles an empty query', () => {
      const endpoint = new Endpoint('some/path');
      endpoint.fetchResults = jest.fn();

      return endpoint.withIds('').then((result) => {
        expect(result).toHaveLength(0);
        expect(endpoint.fetchResults).not.toHaveBeenCalled();
      });
    });

    it('hits our API otherwise', () => {
      const endpoint = new Endpoint('some/path');
      endpoint.fetchResults = jest.fn(() => Promise.resolve([1, 2, 3]));

      return endpoint.withIds('1,3').then((result) => {
        expect(result).toEqual([1, 2, 3]);
        expect(endpoint.fetchResults).toHaveBeenCalledWith({ id__in: '1,3' });
      });
    });
  });

  describe('fetchResults', () => {
    it('hits the correct api and transforms the results', () => {
      const getFn = mockAxios([2, 4, 6]);
      process.env.API_URL = 'http://example.com/root/';
      const endpoint = new Endpoint('some/path');

      return endpoint.fetchResults({ some: 'param' }).then((result) => {
        expect(result).toEqual([2, 4, 6]);
        expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://example.com/root/' });
        expect(getFn).toHaveBeenCalledWith('some/path', { params: { some: 'param' } });
      });
    });
  });

  describe('caching', () => {
    it('caches query results', () => {
      mockAxios([1, 3, 5], [2, 4, 6]);
      const sameParams = { some: 'param' };
      const differentParams = { other: 'params' };
      const endpoint = new Endpoint('some/path');

      return endpoint
        .fetchResults(sameParams)
        .then((result) => {
          expect(result).toEqual([1, 3, 5]);
          return endpoint.fetchResults(sameParams);
        })
        .then((result) => {
          // Same result after second call
          expect(result).toEqual([1, 3, 5]);
          return endpoint.fetchResults(differentParams);
        })
        .then((result) => {
          expect(result).toEqual([2, 4, 6]);
        });
    });
  });

  describe('fetchOne', () => {
    it('hits the correct url', () => {
      const getFn = mockAxios('results!');
      const endpoint = new Endpoint('some/path/');
      return endpoint.fetchOne(44).then((data) => {
        expect(data).toEqual({ results: 'results!' });
        expect(getFn).toHaveBeenCalledWith('some/path/44/');
      });
    });
    it('caches results', () => {
      mockAxios('original!', 'call2');
      const endpoint = new Endpoint('some/path/');
      return endpoint.fetchOne('a').then((data) => {
        expect(data).toEqual({ results: 'original!' });
        return endpoint.fetchOne('a');
      }).then((data) => {
        expect(data).toEqual({ results: 'original!' });
        return endpoint.fetchOne('b');
      }).then((data) => {
        expect(data).toEqual({ results: 'call2' });
      });
    });
  });
});
