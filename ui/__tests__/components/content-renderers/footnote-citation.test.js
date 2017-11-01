import { mount } from 'enzyme';
import React from 'react';

import FootnoteCitation from '../../../components/content-renderers/footnote-citation';


describe('<FootnoteCitation />', () => {
  it('includes only and all of the text of the content', () => {
    const content = { footnote_node: '', text: 'Some text here\n' };
    const text = mount(<FootnoteCitation content={content} />).text();
    expect(text).toEqual('Some text here\n');
  });
  it('references the footnote node', () => {
    const content = { footnote_node: 'aaa_1__bbb_2', text: '' };
    const html = mount(<FootnoteCitation content={content} />).html();
    expect(html).toMatch(/aaa_1__bbb_2/);
  });
});

