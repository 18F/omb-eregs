import { shallow } from 'enzyme';
import React from 'react';

import Section from '../../../components/node-renderers/sec';

describe('<Section />', () => {
  const docNode = { identifier: 'aaa_1__bbb_2' };
  it('includes an identifier', () => {
    const result = shallow(<Section docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
  });
  it('includes children', () => {
    const result = shallow(
      <Section docNode={docNode}>
        <childA />
      </Section>);
    expect(result.find('childA')).toHaveLength(1);
  });
});
