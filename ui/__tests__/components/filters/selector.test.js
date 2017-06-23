
import { shallow } from 'enzyme';
import React from 'react';

import Selector from '../../../components/filters/selector';
import * as redirects from '../../../redirects';
import mockRouter from '../../util/mockRouter';

jest.mock('../../../redirects');


describe('<Selector />', () => {
  it('changes the URL on selection', () => {
    redirects.redirectQuery = jest.fn(() => ({ dummy: 'data' }));
    const router = mockRouter({
      pathname: '/some/path/', query: { values: 'mocked' } });
    router.push = jest.fn();

    const el = shallow(
      React.createElement(Selector, {
        'aria-labelledby': 'some_id',
        insertParam: 'insertHere',
        lookup: 'topics',
        pathname: '/some/path/',
      }), { context: { router } });
    expect(el.children()).toHaveLength(2);

    const autocompleter = el.childAt(1);
    autocompleter.prop('onChange')({ value: 8 });
    expect(redirects.redirectQuery).toHaveBeenCalledWith(
      { values: 'mocked' }, 'insertHere', 8);
    expect(router.push).toHaveBeenCalledWith('/some/path/?dummy=data');
  });
});
