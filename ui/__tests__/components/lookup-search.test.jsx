import { shallow } from 'enzyme';
import React from 'react';

import { cleanParams, LookupSearch, redirectQuery, search } from '../../components/lookup-search';
import api from '../../api';
import { UserError } from '../../error-handling';

jest.mock('../../api');


describe('cleanParams()', () => {
  const query = {
    q: 'something',
    insertParam: 'ins',
    redirectPathname: '/requirements',
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
        pathname: '/requirements',
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

describe('<LookupSearch />', () => {
  const params = {
    routes: [{ path: 'search-redirect' }, { path: 'topics' }],
    location: {
      query: {
        q: 'searchTerm',
        insertParam: 'ins',
        redirectPathname: '/requirements',
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
      pathname: '/requirements',
      query: { some: 'field', page: '4' },
    });
  });
});


describe('search()', () => {
  it('uses the correct parameters for topics', () => {
    search('topics', 'some query here');
    expect(api.topics.fetch).toHaveBeenCalledWith({
      search: 'some query here', page: '1',
    });
  });

  it('uses the correct parameters for policies', () => {
    search('policies', 'some query here', '3');
    expect(api.policies.fetch).toHaveBeenCalledWith({
      search: 'some query here', page: '3',
    });
  });
});
