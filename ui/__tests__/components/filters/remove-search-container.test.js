import { shallow } from 'enzyme';
import React from 'react';

import { RemoveSearchContainer } from '../../../components/filters/remove-search-container';

describe('<RemoveSearchContainer />', () => {
  it('calculates the correct link', () => {
    const params = {
      field: 'someField',
      route: 'homepage',
      router: { query: { page: '3', some: 'stuff', someField: 'My Search Term' } },
    };
    const result = shallow(<RemoveSearchContainer {...params} />);

    expect(result.prop('route')).toEqual('homepage');
    expect(result.prop('params')).toEqual({ some: 'stuff' });
  });
});
