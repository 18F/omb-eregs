import { mount, shallow } from 'enzyme';
import React from 'react';

import Autocompleter from '../../../components/filters/autocompleter';
import * as lookupSearch from '../../../components/lookup-search';
import mockRouter from '../../util/mockRouter';

jest.mock('../../../components/lookup-search');


describe('<Autocompleter />', () => {
  it('renders differently when we do the full componentDidMount', () => {
    const props = { lookup: 'topics', insertParam: 'someParam' };
    const context = { router: mockRouter({ pathname: '/policies' }) };
    lookupSearch.search = jest.fn(() => Promise.resolve({ results: [] }));

    const el = React.createElement(Autocompleter, props);
    expect(shallow(el, { context }).name()).toEqual('SearchView');
    expect(mount(el, { context }).name()).not.toEqual('SearchView');
  });

  it('queries the API for suggestions', () => {
    const component = new Autocompleter(
      { lookup: 'topics', insertParam: 'aaa' }, { router: mockRouter() });
    lookupSearch.search = jest.fn(() => Promise.resolve({ results: [
      { id: 4, name: 'four' }, { id: 9, name: 'nine' },
    ] }));

    return component.loadOptions('term-here').then((result) => {
      expect(lookupSearch.search).toHaveBeenCalledWith('topics', 'term-here');
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
    const component = new Autocompleter(
      { lookup: 'topics', insertParam: 'insertHere' }, { router });
    component.onChange({ value: 8 });
    expect(lookupSearch.redirectQuery).toHaveBeenCalledWith(
      { values: 'mocked' }, 'insertHere', 8);
    expect(router.push).toHaveBeenCalledWith('/some/path/?dummy=data');
  });
});
