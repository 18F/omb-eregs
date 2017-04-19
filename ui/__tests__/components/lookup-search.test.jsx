import { shallow } from 'enzyme';
import React from 'react';

import { cleanParams, LookupSearch, redirectIfMatched, redirectQuery, search } from '../../components/lookup-search';
import api from '../../api';
import { UserError } from '../../error-handling';

jest.mock('../../api');


describe('cleanParams()', () => {
  const query = {
    q: 'something',
    insertParam: 'ins',
    redirectPathname: '/requirements/by-topic',
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
    expect(() => cleanParams(queryCopy)).toThrow(UserError);
  });

  it('gives cleans the parameter values', () => {
    expect(cleanParams(query)).toEqual({
      q: 'something',
      insertParam: 'ins',
      redirect: {
        pathname: '/requirements/by-topic',
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
    redirectPathname: '/requirements/by-topic',
  };
  const routes = [{ path: 'topics' }, {}];
  it('does not hit the api if a page number is present', () => {
    const modifiedQuery = Object.assign({}, query, { page: '5' });
    const params = { routes, location: { query: modifiedQuery } };
    const redirect = jest.fn();
    const done = jest.fn();

    redirectIfMatched(params, redirect, done);
    expect(api.topics.fetch).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith();
  });
  it('redirects if there is an exact match', () => {
    const params = { routes, location: { query } };
    const redirect = jest.fn();
    api.topics.fetch.mockImplementationOnce(() =>
      Promise.resolve({ count: 1, results: [{ id: 4 }] }));

    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then(() => {
      expect(api.topics.fetch).toHaveBeenCalledWith({ name: 'qqq' });
      expect(redirect).toHaveBeenCalled();
    });
  });
  it('passes exceptions up', () => {
    const params = { routes, location: { query } };
    const redirect = jest.fn();
    api.topics.fetch.mockImplementationOnce(() =>
      Promise.reject(Error('oh noes')));
    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then((error) => {
      expect(error).toEqual(Error('oh noes'));
      expect(redirect).not.toHaveBeenCalled();
    });
  });
  it('continues if there is no exact match', () => {
    const params = { routes, location: { query } };
    const redirect = jest.fn();
    api.topics.fetch.mockImplementationOnce(() =>
      Promise.resolve({ count: 0, results: [] }));
    const asyncCall = new Promise(done => redirectIfMatched(params, redirect, done));
    return asyncCall.then(() => {
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});

describe('<LookupSearch />', () => {
  const params = {
    routes: [{ path: 'topics' }, {}],
    location: {
      query: {
        q: 'searchTerm',
        insertParam: 'ins',
        redirectPathname: '/requirements/by-topic',
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
      pathname: '/requirements/by-topic',
      query: { some: 'field', page: '4' },
    });
  });
});


describe('search()', () => {
  it('uses the correct parameters for topics', () => {
    search('topics', 'some query here');
    expect(api.topics.fetch).toHaveBeenCalledWith({
      name__icontains: 'some query here', page: '1',
    });
  });

  it('uses the correct parameters for policies', () => {
    search('policies', 'some query here', '3');
    expect(api.policies.fetch).toHaveBeenCalledWith({
      title__icontains: 'some query here', page: '3',
    });
  });
});
