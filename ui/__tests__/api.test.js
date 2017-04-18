import axios from 'axios';

import { Endpoint } from '../api';

jest.mock('axios');
jest.mock('../config', () => ({ apiRoot: 'http://example.com/root/' }));


function mockAxios(...resultSets) {
  const get = jest.fn();
  resultSets.forEach(results =>
    get.mockImplementationOnce(() => Promise.resolve({ data: { results } })));
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

      return endpoint.withIds('ids,here').then((result) => {
        expect(result).toEqual([1, 2, 3]);
        expect(endpoint.fetchResults).toHaveBeenCalledWith(
          { id__in: 'ids,here' });
      });
    });
  });

  describe('fetchResults', () => {
    it('hits the correct api and transforms the results', () => {
      const getFn = mockAxios([2, 4, 6]);
      const endpoint = new Endpoint('some/path');

      return endpoint.fetchResults({ some: 'param' }).then((result) => {
        expect(result).toEqual([2, 4, 6]);
        expect(axios.create).toHaveBeenCalledWith(
          { baseURL: 'http://example.com/root/' });
        expect(getFn).toHaveBeenCalledWith(
          'some/path', { params: { some: 'param' } });
      });
    });
  });

  describe('caching', () => {
    it('caches query results', () => {
      mockAxios([1, 3, 5], [2, 4, 6]);
      const sameParams = { some: 'param' };
      const differentParams = { other: 'params' };
      const endpoint = new Endpoint('some/path');

      return endpoint.fetchResults(sameParams)
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
});
