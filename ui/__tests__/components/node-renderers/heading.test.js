import { shallow } from 'enzyme';
import React from 'react';

import Heading from '../../../components/node-renderers/heading';

describe('<Heading />', () => {
  it('includes node text and identifier', () => {
    const docNode = { identifier: 'aaa_1__bbb_2' };
    const result = shallow(
      <Heading docNode={docNode}><span>More more</span></Heading>);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
    expect(result.text()).toBe('More more');
  });
  it('generates an h1 when there are no sections', () => {
    const docNode = { identifier: 'aaa_1__bbb_2__ccc_3' };
    const result = shallow(<Heading docNode={docNode} />);
    expect(result.name()).toBe('h1');
  });
  it('generates an h4 if there are three sections', () => {
    const docNode = {
      identifier: 'root_1__sec_4__sec_a__appendix_A__sec_3__heading_1',
    };
    const result = shallow(<Heading docNode={docNode} />);
    expect(result.name()).toBe('h4');
  });
});
