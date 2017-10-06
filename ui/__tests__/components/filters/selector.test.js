
import { shallow } from 'enzyme';
import React from 'react';

import { Selector } from '../../../components/filters/selector';
import * as lookupSearch from '../../../lookup-search';
import { Router } from '../../../routes';

jest.mock('../../../lookup-search', () => ({
  apiNameField: { topics: null },
  makeOptionLoader: jest.fn(() => () => []),
  redirectQuery: jest.fn(),
}));
jest.mock('../../../routes', () => ({ Router: { pushRoute: jest.fn() } }));


describe('<Selector />', () => {
  it('changes the URL on selection', () => {
    lookupSearch.redirectQuery.mockReturnValueOnce({ dummy: 'data' });
    const router = { pathname: '/some/path', query: { values: 'mocked' } };

    const el = shallow(
      <Selector
        aria-labelledby="some_id"
        insertParam="insertHere"
        lookup="topics"
        route="requirements"
        router={router}
      />);
    expect(el.children()).toHaveLength(2);

    const autocompleter = el.childAt(1);
    autocompleter.prop('onChange')({ value: 8 });

    expect(lookupSearch.redirectQuery).toHaveBeenCalledWith(
      { values: 'mocked' }, 'insertHere', 8);
    expect(Router.pushRoute).toHaveBeenCalledWith(
      'requirements', { dummy: 'data' });
  });
});
