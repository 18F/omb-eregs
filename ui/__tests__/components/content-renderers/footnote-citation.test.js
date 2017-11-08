import { mount } from 'enzyme';
import React from 'react';

import FootnoteCitation from '../../../components/content-renderers/footnote-citation';


describe('<FootnoteCitation />', () => {
  it('includes all of the text of the content', () => {
    const content = { footnote_node: '', text: 'Some text here ' };
    const text = mount(<FootnoteCitation content={content} />).text();
    expect(text).toMatch(/Some text here /);
    expect(text).toMatch(/Footnote /);
  });

  it('references the footnote node', () => {
    const content = { footnote_node: 'aaa_1__bbb_2', text: '' };
    const html = mount(<FootnoteCitation content={content} />).html();
    expect(html).toMatch(/aaa_1__bbb_2/);
  });

  it('expands on click', () => {
    const content = { footnote_node: 'aaa_1__bbb_2', text: '' };
    const footnote = mount(<FootnoteCitation content={content} />);
    footnote.find('a').simulate('click');
    expect(footnote.html()).toMatch(/active footnote-link/);
    expect(footnote.html()).toMatch(/node-footnote/);
  });
});

