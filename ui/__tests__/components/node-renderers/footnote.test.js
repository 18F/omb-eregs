import { shallow } from 'enzyme';
import React from 'react';

import Footnote from '../../../components/node-renderers/footnote';

describe('<Footnote />', () => {
  const props = {
    docNode: { identifier: 'aaa_1__bbb_2__ccc_3', marker: '8' },
    renderedContent: [<span key="1">Textextext</span>],
  };
  it('includes the identifier', () => {
    const result = shallow(<Footnote {...props} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes node text', () => {
    const paragraphs = shallow(<Footnote {...props} />).find('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs.first().text()).toBe('Textextext');
  });
  it('includes the marker', () => {
    const marker = shallow(<Footnote {...props} />).children().first();
    expect(marker.text()).toBe('8');
  });
});

