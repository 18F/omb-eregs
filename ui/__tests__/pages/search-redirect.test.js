import { shallow } from 'enzyme';
import React from 'react';

import { LookupSearch } from '../../pages/search-redirect';


describe('<LookupSearch />', () => {
  const params = {
    pagedEntries: {
      count: 2,
      results: [{ id: 1 }, { id: 2 }],
    },
    userParams: {
      q: 'searchTerm',
      insertParam: 'ins',
      lookup: 'topics',
      redirect: { route: 'requirements', query: { some: 'field', page: '4' } },
    }
  };

  it('contains the right number of entries', () => {
    const result = shallow(<LookupSearch {...params} />);
    expect(result.find('Entry')).toHaveLength(2);
  });
  it('has a "back" link', () => {
    const link = shallow(<LookupSearch {...params} />).find('LinkRoutes').first();
    expect(link.prop('route')).toEqual('requirements');
    expect(link.prop('params')).toEqual({ some: 'field', page: '4' });
  });

  it('has a pager if there are results', () => {
    const result = shallow(<LookupSearch {...params} />);
    expect(result.find('withRoute(Pagers)')).toHaveLength(1);
    expect(result.text()).not.toMatch(/No topics found/);
  });

  it('does not have a pager if there are no results', () => {
    const modifiedParams = {
      pagedEntries: { count: 0, results: [] },
      userParams: { ...params.userParams, lookup: 'policies' },
    };

    const result = shallow(<LookupSearch {...modifiedParams} />);
    expect(result.find('Pagers')).toHaveLength(0);
    expect(result.text()).toMatch(/No policies found/);
  });
});
