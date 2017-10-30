import { shallow } from 'enzyme';
import React from 'react';

import Section from '../../../components/node-renderers/sec';

describe('<Section />', () => {
  const docNode = { identifier: 'aaa_1__bbb_2' };
  it('includes an identifier', () => {
    const result = shallow(<Section docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
  });
  it('has some padding', () => {
    const style = shallow(<Section docNode={docNode} />).prop('style');
    expect(style).toBeTruthy();
    expect(style.paddingLeft).toBeTruthy();
    expect(style.paddingRight).toBeTruthy();
  });
  it('includes children', () => {
    const result = shallow(
      <Section docNode={docNode}>
        <childA />
      </Section>);
    expect(result.find('childA')).toHaveLength(1);
  });
});
