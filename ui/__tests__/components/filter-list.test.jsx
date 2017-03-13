import axios from 'axios';
import { shallow } from 'enzyme';
import React from 'react';

import FilterList, { AddKeyword, fetchData, Filter } from '../../components/filter-list';

jest.mock('axios');
jest.mock('../../globals', () => ({ apiUrl: jest.fn(() => 'api-start/') }));


describe('fetchData()', () => {
  it('handles an empty query', () => {
    const props = { location: { query: {} } };
    return fetchData(props).then(result =>
      expect(result).toHaveLength(0));
  });
  it('hits our API when a keyword is present', () => {
    const props = { location: { query: { keywords__id__in: 'ids,here' } } };
    axios.get = jest.fn(
      () => Promise.resolve({ data: { results: [1, 2, 3] } }),
    );
    return fetchData(props).then((result) => {
      expect(result).toEqual([1, 2, 3]);
      expect(axios.get).toHaveBeenCalledWith(
        'api-start/keywords/', { params: { id__in: 'ids,here' } },
      );
    });
  });
});

describe('<FilterList />', () => {
  it('passed transformed args to its Filters', () => {
    const params = {
      location: { query: { keywords__id__in: '1,7,10', some: 'field', page: '5' } },
      keywords: [{ id: 1, name: 'a' }],
    };
    const filter = shallow(<FilterList {...params} />).find('Filter').first();
    expect(filter.prop('keywordIds')).toEqual(['1', '7', '10']);
    expect(filter.prop('keyword')).toEqual({ id: 1, name: 'a' });
    expect(filter.prop('query')).toEqual({ some: 'field' });
  });
  it('contains the correct number of Filters', () => {
    const params = {
      location: { query: {} },
      keywords: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    };
    let result = shallow(<FilterList {...params} />);
    expect(result.find('Filter')).toHaveLength(4);

    params.keywords.pop();
    result = shallow(<FilterList {...params} />);
    expect(result.find('Filter')).toHaveLength(3);
  });
  it('contains an AddKeyword', () => {
    const params = { location: { query: {} }, keywords: [] };
    const result = shallow(<FilterList {...params} />);
    expect(result.find('DoesNotExist')).toHaveLength(0);
    expect(result.find('AddKeyword')).toHaveLength(1);
  });
});

describe('<AddKeyword />', () => {
  it('creates a form with the correct url', () => {
    const result = shallow(<AddKeyword location={{ query: {} }} />);
    expect(result.prop('action')).toEqual('/keywords/search-redirect/');
    expect(result.prop('method')).toEqual('GET');
  });
  it('contains a hidden element for each param', () => {
    const location = { query: { some: 'thing', more: 'params', et: 'c' } };
    const result = shallow(<AddKeyword location={location} />);
    expect(result.contains(
      <input key="some" type="hidden" name="redirectQuery__some" value="thing" />,
    )).toBeTruthy();
    expect(result.contains(
      <input key="more" type="hidden" name="redirectQuery__more" value="params" />,
    )).toBeTruthy();
    expect(result.contains(
      <input key="et" type="hidden" name="redirectQuery__et" value="c" />,
    )).toBeTruthy();
  });
});

describe('<Filter />', () => {
  const params = {
    keywordIds: ['3', '5', '7'],
    query: { some: 'stuff' },
    keyword: { id: 5, name: 'AkeyWord' },
  };
  const result = shallow(<Filter {...params} />);

  it('contains the keyword name', () => {
    expect(result.text()).toMatch(/AkeyWord/);
  });
  it('links to the proper destination', () => {
    const link = result.find('Link').first();
    expect(link.prop('to')).toEqual({
      pathname: '/requirements/',
      query: { some: 'stuff', keywords__id__in: '3,7' },
    });
  });
});
