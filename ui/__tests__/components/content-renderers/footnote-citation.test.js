import { mount } from 'enzyme';
import React from 'react';

import FootnoteCitation from '../../../components/content-renderers/footnote-citation';


describe('<FootnoteCitation />', () => {
  it('includes all of the text of the content', () => {
    const content = {
      footnote_node: { identifier: '' },
      text: 'Some text here ',
    };
    const text = mount(<FootnoteCitation content={content} />).text();
    expect(text).toMatch(/Some text here /);
    expect(text).toMatch(/Footnote /);
  });

  it('references the footnote node', () => {
    const content = {
      footnote_node: { identifier: 'aaa_1__bbb_2' },
      text: '',
    };
    const html = mount(<FootnoteCitation content={content} />).html();
    expect(html).toMatch(/aaa_1__bbb_2/);
  });

  it('expands on click', () => {
    const content = {
      footnote_node: {
        children: [],
        content: [],
        identifier: '',
        type_emblem: '10',
      },
      text: 'text content here',
    };
    const footnote = mount(<FootnoteCitation content={content} />);
    expect(footnote.html()).toMatch(/footnote-link/);
    expect(footnote.html()).not.toMatch(/node-footnote/);
    expect(footnote.html()).not.toMatch(/active/);

    footnote.find('a').simulate('click');
    expect(footnote.html()).toMatch(/footnote-link/);
    expect(footnote.html()).toMatch(/node-footnote/);
    expect(footnote.html()).toMatch(/active/);
  });
});

