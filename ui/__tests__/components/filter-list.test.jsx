import { shallow } from 'enzyme';
import React from 'react';

import FilterList, { Filter } from '../../components/filter-list';


describe('<FilterList />', () => {
  it('passed transformed args to its Filters', () => {
    const params = {
      router: { location: { query: { some: 'field', page: '5' } } },
      lookup: 'keywords',
      existingFilters: [
        { id: 1, name: 'a' }, { id: 7, name: 'b' }, { id: 10, name: 'c' },
      ],
    };
    const filter = shallow(<FilterList {...params} />).find('Filter').first();
    expect(filter.prop('existingIds')).toEqual([1, 7, 10]);
    expect(filter.prop('idToRemove')).toEqual(1);
    expect(filter.prop('name')).toEqual('a');
    expect(filter.prop('location')).toEqual(params.router.location);
  });
  it('contains the correct number of Filters', () => {
    const params = {
      router: { location: { query: {} } },
      lookup: 'keywords',
      existingFilters: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    };
    let result = shallow(<FilterList {...params} />);
    expect(result.find('Filter')).toHaveLength(4);

    params.existingFilters.pop();
    result = shallow(<FilterList {...params} />);
    expect(result.find('Filter')).toHaveLength(3);
  });
  it('contains an AddKeyword', () => {
    const params = {
      router: { location: { query: {} } },
      lookup: 'keywords',
      existingFilters: [],
    };
    const result = shallow(<FilterList {...params} />);
    expect(result.find('DoesNotExist')).toHaveLength(0);
    expect(result.find('SearchAutocomplete')).toHaveLength(1);
  });
});

describe('<Filter />', () => {
  const params = {
    existingIds: [3, 5, 7],
    idToRemove: 5,
    location: { pathname: '/path/', query: { some: 'stuff' } },
    name: 'AkeyWord',
    removeParam: 'someStr',
  };
  const result = shallow(<Filter {...params} />);

  it('contains the keyword name', () => {
    expect(result.text()).toMatch(/AkeyWord/);
  });
  it('links to the proper destination', () => {
    const link = result.find('Link').first();
    expect(link.prop('to')).toEqual({
      pathname: '/path/',
      query: { some: 'stuff', someStr: '3,7' },
    });
  });
});
