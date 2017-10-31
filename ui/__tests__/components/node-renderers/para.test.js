import { shallow } from 'enzyme';
import React from 'react';

import Paragraph from '../../../components/node-renderers/para';

describe('<Paragraph />', () => {
  const props = {
    docNode: { identifier: 'aaa_1__bbb_2__ccc_3' },
    renderedContent: [<span key="1">Textextext</span>],
  };
  it('includes the identifier', () => {
    const result = shallow(<Paragraph {...props} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes node text', () => {
    const paragraphs = shallow(<Paragraph {...props} />).find('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs.first().text()).toBe('Textextext');
  });
  it('includes children', () => {
    const result = shallow(
      <Paragraph {...props} >
        <thing1 /><thing2>contents</thing2>
      </Paragraph>);
    expect(result.find('thing1')).toHaveLength(1);
    expect(result.find('thing2')).toHaveLength(1);
  });
});
