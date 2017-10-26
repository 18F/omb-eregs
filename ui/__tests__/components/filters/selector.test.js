
import { shallow } from 'enzyme';
import React from 'react';

import { Selector } from '../../../components/filters/selector';
import * as queries from '../../../util/api/queries';
import { Router } from '../../../routes';

jest.mock('../../../routes', () => ({ Router: { pushRoute: jest.fn() } }));
jest.mock('../../../util/api/queries', () => ({
  redirectQuery: jest.fn(),
}));


describe('<Selector />', () => {
  it('changes the URL on selection', () => {
    queries.redirectQuery.mockReturnValueOnce({ dummy: 'data' });
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

    expect(queries.redirectQuery).toHaveBeenCalledWith(
      { values: 'mocked' }, 'insertHere', 8);
    expect(Router.pushRoute).toHaveBeenCalledWith(
      'requirements', { dummy: 'data' });
  });
});
