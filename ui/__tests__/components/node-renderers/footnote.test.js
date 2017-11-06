import { shallow } from 'enzyme';
import React from 'react';

import Footnote from '../../../components/node-renderers/footnote';

describe('<Footnote />', () => {
  const docNode = {
    children: [],
    identifier: 'aaa_1__bbb_2__ccc_3',
    marker: '8',
  };
  const result = shallow(
    <Footnote docNode={docNode}><span>Textextext</span></Footnote>);

  it('includes the identifier', () => {
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes node text', () => {
    const paragraphs = result.find('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs.first().text()).toBe('Textextext');
  });
  it('includes the marker', () => {
    const marker = result.children().first();
    expect(marker.text()).toBe('8');
  });
});

