import { mount } from 'enzyme';
import React from 'react';

import { FootnoteCitation, mapStateToProps } from '../../../components/content-renderers/footnote-citation';

function footnoteNode(attrs = null) {
  const defaultAttrs = { children: [], content: [], identifier: '' };
  return Object.assign({}, defaultAttrs, attrs || {});
}

describe('<FootnoteCitation />', () => {
  let exampleProps = {
    content: { footnote_node: footnoteNode(), text: '' },
    expanded: false,
  };
  beforeEach(() => {
    exampleProps = {
      ...exampleProps,
      closeFootnote: jest.fn(),
      openFootnote: jest.fn(),
    };
  });

  it('includes all of the text of the content', () => {
    const props = {
      ...exampleProps,
      content: {
        footnote_node: footnoteNode(),
        text: 'Some text here ',
      },
    };
    const text = mount(<FootnoteCitation {...props} />).text();
    expect(text).toMatch(/Some text here /);
    expect(text).toMatch(/Footnote /);
  });

  it('references the footnote node', () => {
    const props = {
      ...exampleProps,
      content: {
        footnote_node: footnoteNode({ identifier: 'aaa_1__bbb_2' }),
        text: '',
      },
    };
    const html = mount(<FootnoteCitation {...props} />).html();
    expect(html).toMatch(/aaa_1__bbb_2/);
  });

  it('has a closed state', () => {
    const props = { ...exampleProps, expanded: false };
    const footnote = mount(<FootnoteCitation {...props} />);
    expect(footnote.html()).toMatch(/footnote-link/);
    expect(footnote.html()).not.toMatch(/node-footnote/);
    expect(footnote.html()).not.toMatch(/active/);
  });

  it('has an expanded state', () => {
    const props = { ...exampleProps, expanded: true };
    const footnote = mount(<FootnoteCitation {...props} />);
    expect(footnote.html()).toMatch(/footnote-link/);
    expect(footnote.html()).toMatch(/node-footnote/);
    expect(footnote.html()).toMatch(/active/);
  });

  it('focuses on footnote link once "close" btn is clicked', () => {
    const props = { ...exampleProps, expanded: true };
    const wrapper = mount(<FootnoteCitation {...props} />);
    const link = wrapper.find('Link').getDOMNode();
    const closeBtn = wrapper.find('.close-button');
    closeBtn.simulate('click');
    expect(global.window.document.activeElement).toEqual(link);
  });

  it('focuses on citation once footnote opens', () => {
    const props = { ...exampleProps, expanded: false };
    const wrapper = mount(<FootnoteCitation {...props} />);
    wrapper.setProps({ expanded: true });
    const citation = wrapper.find('.footnote-wrapper').getDOMNode();
    expect(global.window.document.activeElement).toEqual(citation);
  });

  it('triggers a state transition if clicked when closed', () => {
    const content = {
      footnote_node: footnoteNode({ identifier: 'aaa_1__bbb_2' }),
      text: '',
    };
    const props = {
      ...exampleProps,
      expanded: false,
      content,
    };
    const link = mount(<FootnoteCitation {...props} />).find('Link');
    link.simulate('click');
    expect(props.openFootnote).toHaveBeenCalledTimes(1);
    expect(props.openFootnote).toHaveBeenCalledWith('aaa_1__bbb_2');
    expect(props.closeFootnote).not.toHaveBeenCalled();
  });

  it('triggers a state transition if clicked when open', () => {
    const props = {
      ...exampleProps,
      expanded: true,
    };
    const link = mount(<FootnoteCitation {...props} />).find('Link');
    link.simulate('click');
    expect(props.openFootnote).not.toHaveBeenCalled();
    expect(props.closeFootnote).toHaveBeenCalledTimes(1);
  });
});

describe('mapStateToProps()', () => {
  const props = { content: { footnote_node: { identifier: 'aaa_1' } } };
  it('converts to an expanded state', () => {
    const result = mapStateToProps({ openedFootnote: 'aaa_1' }, props);
    expect(result).toEqual({ expanded: true });
  });
  it('handles null', () => {
    const result = mapStateToProps({ openedFootnote: null }, props);
    expect(result).toEqual({ expanded: false });
  });
  it('will not be expanded if a different footnote is selected', () => {
    const result = mapStateToProps({ openedFootnote: 'bbb_2' }, props);
    expect(result).toEqual({ expanded: false });
  });
});
