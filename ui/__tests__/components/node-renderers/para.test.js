import { shallow } from 'enzyme';
import React from 'react';

import Paragraph from '../../../components/node-renderers/para';

describe('<Paragraph />', () => {
  const docNode = { identifier: 'aaa_1__bbb_2__ccc_3', text: 'Textextext' };
  it('includes the identifier', () => {
    const result = shallow(<Paragraph docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes node text', () => {
    const paragraphs = shallow(<Paragraph docNode={docNode} />).find('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs.first().text()).toBe('Textextext');
  });
  it('includes children', () => {
    const result = shallow(
      <Paragraph docNode={docNode}>
        <thing1 /><thing2>contents</thing2>
      </Paragraph>);
    expect(result.find('thing1')).toHaveLength(1);
    expect(result.find('thing2')).toHaveLength(1);
  });
});
