import { shallow } from 'enzyme';
import React from 'react';

import { UserError } from '../../error-handling';
import { cleanParams, LookupSearch } from '../../pages/search-redirect';


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

  ['insertParam', 'redirectPathname'].forEach((param) => {
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

  it('has a pager if there are results', () => {
    const result = shallow(<LookupSearch {...params} />);
    expect(result.find('Pagers')).toHaveLength(1);
    expect(result.text()).not.toMatch(/No topics found/);
  });

  it('does not have a pager if there are no results', () => {
    const modifiedParams = Object.assign({}, params, {
      pagedEntries: { count: 0, results: [] },
      routes: [{ path: 'search-redirect' }, { path: 'thingies' }],
    });
    const result = shallow(<LookupSearch {...modifiedParams} />);
    expect(result.find('Pagers')).toHaveLength(0);
    expect(result.text()).toMatch(/No thingies found/);
  });
});
