import { shallow } from 'enzyme';
import React from 'react';

import Policy from '../../../components/nodeRenderers/policy';

describe('<Policy />', () => {
  const docNode = { identifier: 'aaa_1__bbb_2' };
  it('includes the identifier', () => {
    const result = shallow(<Policy docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
  });
  it('includes children', () => {
    const result = shallow(
      <Policy docNode={docNode}>
        <childA /><childB /><childA />
      </Policy>);
    expect(result.find('childA')).toHaveLength(2);
    expect(result.find('childB')).toHaveLength(1);
  });
});
