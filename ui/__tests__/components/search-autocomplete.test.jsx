import { mount, shallow } from 'enzyme';
import React from 'react';

import SearchAutocomplete from '../../components/search-autocomplete';
import * as lookupSearch from '../../components/lookup-search';
import mockRouter from '../util/mockRouter';

jest.mock('../../components/lookup-search');


describe('<SearchAutocomplete /> form', () => {
  it('creates a form with the correct url', () => {
    const context = { router: mockRouter() };
    const result = shallow(<SearchAutocomplete lookup="keywords" />, { context });
    expect(result.prop('action')).toEqual('/keywords/search-redirect/');
    expect(result.prop('method')).toEqual('GET');
  });
  it('contains a hidden element for each param', () => {
    const context = {
      router: mockRouter({ query: { some: 'thing', more: 'params', et: 'c' } }),
    };
    const result = shallow(<SearchAutocomplete />, { context });
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

describe('<SearchAutocomplete /> autocompleter', () => {
  it('renders differently when we do the full componentDidMount', () => {
    const context = { router: mockRouter() };
    expect(shallow(<SearchAutocomplete />, { context }).name()).toEqual('form');
    expect(mount(<SearchAutocomplete />, { context }).name()).not.toEqual('form');
  });

  it('returns no results when given empty input', () => {
    const component = new SearchAutocomplete(
      { lookup: 'keywords' }, { router: mockRouter() });
    return component.loadOptions('    ').then((result) => {
      expect(result.options).toHaveLength(0);
    });
  });

  it('queries the API for suggestions', () => {
    const component = new SearchAutocomplete(
      { lookup: 'keywords' }, { router: mockRouter() });
    lookupSearch.search = jest.fn(() => Promise.resolve({ results: [
      { id: 4, name: 'four' }, { id: 9, name: 'nine' },
    ] }));

    return component.loadOptions('term-here').then((result) => {
      expect(lookupSearch.search).toHaveBeenCalledWith('keywords', 'term-here');
      expect(result).toEqual({
        options: [{ value: 4, label: 'four' }, { value: 9, label: 'nine' }],
      });
    });
  });
  it('changes the URL on selection', () => {
    lookupSearch.redirectQuery = jest.fn(() => ({ dummy: 'data' }));
    const router = mockRouter({
      pathname: '/some/path/', query: { values: 'mocked' } });
    router.push = jest.fn();
    const component = new SearchAutocomplete(
      { insertParam: 'insertHere' }, { router });
    component.onChange({ value: 8 });
    expect(lookupSearch.redirectQuery).toHaveBeenCalledWith(
      { values: 'mocked' }, 'insertHere', 8);
    expect(router.push).toHaveBeenCalledWith('/some/path/?dummy=data');
  });
});
