import { shallow } from 'enzyme';
import React from 'react';

import Paragraph from '../../../components/node-renderers/para';
import renderNode from '../../../util/render-node';

jest.mock(
  '../../../util/render-node',
  () => jest.fn((_, idx) => <child key={idx}>some child</child>),
);

describe('<Paragraph />', () => {
  const docNode = {
    children: [{ first: 'child' }, { second: 'child' }],
    identifier: 'aaa_1__bbb_2__ccc_3',
  };
  const result = shallow(
    <Paragraph docNode={docNode}><span>Textextext</span></Paragraph>);

  it('includes the identifier', () => {
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes node text', () => {
    const paragraphs = result.find('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs.first().text()).toBe('Textextext');
  });
  it('includes children', () => {
    expect(result.text()).toMatch(/some child.*some child/);
    expect(result.find('child')).toHaveLength(2);
    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode.mock.calls[0][0]).toEqual({ first: 'child' });
    expect(renderNode.mock.calls[1][0]).toEqual({ second: 'child' });
  });
});
