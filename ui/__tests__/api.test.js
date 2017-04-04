import axios from 'axios';

import { Endpoint } from '../api';

jest.mock('axios');
jest.mock('../config', () => ({ apiRoot: 'http://example.com/root/' }));

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
      const getFn = jest.fn(() => Promise.resolve(
        { data: { results: [2, 4, 6] } }));
      axios.create.mockImplementationOnce(() => ({ get: getFn }));
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
});
