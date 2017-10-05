import { shallow } from 'enzyme';
import React from 'react';

import { RemoveLinkContainer } from '../../../components/filters/remove-link-container';

describe('<RemoveLinkContainer />', () => {
  it('calculates the correct link', () => {
    const params = {
      existing: [1, 7, 10],
      field: 'someField',
      heading: 'FieldName',
      idToRemove: 7,
      name: 'A Value',
      route: 'policies',
      router: { query: { page: '3', some: 'stuff', someField: '1,7,10' } },
    };
    const result = shallow(<RemoveLinkContainer {...params} />);

    expect(result.prop('route')).toEqual('policies');
    expect(result.prop('params')).toEqual({ some: 'stuff', someField: '1,10' });
  });
});
