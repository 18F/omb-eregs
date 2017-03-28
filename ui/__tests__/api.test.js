import axios from 'axios';

import { Endpoint } from '../api';

jest.mock('axios');

describe('Endpoint', () => {
  describe('withIds', () => {
    it('handles an empty query', () => {
      const endpoint = new Endpoint('http://example.com/', 'some/path');
      endpoint.fetchResults = jest.fn();

      return endpoint.withIds('').then((result) => {
        expect(result).toHaveLength(0);
        expect(endpoint.fetchResults).not.toHaveBeenCalled();
      });
    });

    it('hits our API otherwise', () => {
      const endpoint = new Endpoint('http://example.com/', 'some/path');
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
      const endpoint = new Endpoint('http://example.com/', 'some/path');
      axios.get = jest.fn(() => Promise.resolve(
        { data: { results: [2, 4, 6] } }));

      return endpoint.fetchResults({ some: 'param' }).then((result) => {
        expect(result).toEqual([2, 4, 6]);
        expect(axios.get).toHaveBeenCalledWith(
          'http://example.com/some/path/', { params: { some: 'param' } });
      });
    });
  });
});
