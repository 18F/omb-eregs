import { shallow } from 'enzyme';
import React from 'react';

import List from '../../../components/node-renderers/list';

describe('<List />', () => {
  const props = {
    docNode: { identifier: 'aaa_1__bbb_2__ccc_3' },
  };
  it('includes the identifier', () => {
    const result = shallow(<List {...props} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes children', () => {
    const result = shallow(
      <List {...props} >
        <thing1 /><thing2>contents</thing2>
      </List>);
    expect(result.find('thing1')).toHaveLength(1);
    expect(result.find('thing2')).toHaveLength(1);
  });
});

