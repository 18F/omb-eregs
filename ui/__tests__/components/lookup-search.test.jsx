import axios from 'axios';
import { shallow } from 'enzyme';
import React from 'react';

import { cleanParams, LookupSearch, redirectIfMatched, redirectQuery } from '../../components/lookup-search';

jest.mock('axios');
jest.mock('../../globals', () => ({ apiUrl: jest.fn(() => 'api-start/') }));

describe('cleanParams()', () => {
  const query = {
    q: 'something',
    insertParam: 'ins',
    redirectPathname: '/some/path',
    redirectQuery__param: 'value',
    redirectQuery__et: 'c',
  };

  it('does not raise an arrow when all fields are present', () => {
    expect(() => cleanParams(query)).not.toThrow();
  });

  ['q', 'insertParam', 'redirectPathname'].forEach((param) => {
    it(`raises an error when ${param} is not present`, () => {
      const queryCopy = Object.assign({}, query);
      delete queryCopy[param];
      expect(() => cleanParams(queryCopy)).toThrow();
    });
    it(`raises an error when ${param} is empty`, () => {
      const queryCopy = Object.assign({}, query, { [param]: '' });
      expect(() => cleanParams(queryCopy)).toThrow();
    });
  });

  it('raised an error when the pathname is to a different domain', () => {
    const queryCopy = Object.assign({}, query, {
      redirectPathname: 'https://example.com/',
    });
    expect(() => cleanParams(queryCopy)).toThrow();
  });

  it('gives cleans the parameter values', () => {
    expect(cleanParams(query)).toEqual({
      q: 'something',
      insertParam: 'ins',
      redirect: {
        pathname: '/some/path',
        query: {
          param: 'value',
          et: 'c',
        },
      },
      page: '1',
    });
  });
});

describe('redirectQuery()', () => {
  it('updates an empty query', () => {
    const result = redirectQuery({ some: 'thing' }, 'myParam', 3);
    expect(result).toEqual({ some: 'thing', myParam: '3' });
  });
  it('updates a populated query', () => {
    const query = { some: 'thing', myParam: '1,7,9' };
    const result = redirectQuery(query, 'myParam', 3);
    expect(result).toEqual({ some: 'thing', myParam: '1,7,9,3' });
  });
});

describe('redirectIfMatched()', () => {
  const query = {
    q: 'qqq',
    insertParam: 'ins',
    redirectPathname: '/somewhere/',
  };
  it('does not hit the api if a page number is present', () => {
    const modifiedQuery = Object.assign({}, query, { page: '5' });
    const params = { routes: [], location: { query: modifiedQuery } };
    const redirect = jest.fn();
    const done = jest.fn();
    axios.get = jest.fn();

    redirectIfMatched(params, redirect, done);
    expect(axios.get).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith();
  });
  it('redirects if there is an exact match', () => {
    const params = { routes: [{ path: 'keywords' }, {}], location: { query } };
    const redirect = jest.fn();
    axios.get = jest.fn(
      () => Promise.resolve({ data: { count: 1, results: [{ id: 4 }] } }),
    );

    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'api-start/keywords/', { params: { name: 'qqq' } });
      expect(redirect).toHaveBeenCalled();
    });
  });
  it('passes exceptions up', () => {
    const params = { routes: [{ path: 'keywords' }, {}], location: { query } };
    const redirect = jest.fn();
    axios.get = jest.fn(() => Promise.reject(Error('oh noes')));
    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then((error) => {
      expect(error).toEqual(Error('oh noes'));
      expect(redirect).not.toHaveBeenCalled();
    });
  });
  it('continues if there is no exact match', () => {
    const params = { routes: [{ path: 'keywords' }, {}], location: { query } };
    const redirect = jest.fn();
    axios.get = jest.fn(
      () => Promise.resolve({ data: { count: 0, results: [] } }),
    );
    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then(() => {
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});

describe('<LookupSearch />', () => {
  const params = {
    routes: [{ path: 'keywords' }, {}],
    location: {
      query: {
        q: 'searchTerm',
        insertParam: 'ins',
        redirectPathname: '/some/path/here/',
        redirectQuery__some: 'field',
        redirectQuery__page: '4',
      },
    },
    pagedEntries: {
      count: 2,
      results: [{ id: 1 }, { id: 2 }],
    },
  };

  it('contains the right number of entries', () => {
    const result = shallow(<LookupSearch {...params} />);
    expect(result.find('Entry')).toHaveLength(2);
  });
  it('has a "back" link', () => {
    const link = shallow(<LookupSearch {...params} />).find('Link').first();
    expect(link.prop('to')).toEqual({
      pathname: '/some/path/here/',
      query: { some: 'field', page: '4' },
    });
  });
});
