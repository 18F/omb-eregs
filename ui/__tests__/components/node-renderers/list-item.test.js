import { shallow } from 'enzyme';
import React from 'react';

import ListItem from '../../../components/node-renderers/list-item';

describe('<ListItem />', () => {
  const props = {
    docNode: { identifier: 'aaa_1__bbb_2__ccc_3', marker: 'c.!!!' },
  };
  it('includes the identifier', () => {
    const result = shallow(<ListItem {...props} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes the marker', () => {
    const text = shallow(<ListItem {...props} />).text();
    expect(text).toMatch(/c\.!!!/);
  });
  it('includes children', () => {
    const result = shallow(
      <ListItem {...props} >
        <thing1 /><thing2>contents</thing2>
      </ListItem>);
    expect(result.find('thing1')).toHaveLength(1);
    expect(result.find('thing2')).toHaveLength(1);
  });
});

