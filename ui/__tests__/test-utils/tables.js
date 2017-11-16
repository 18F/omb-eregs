import { shallow } from 'enzyme';
import React from 'react';

import nodeFactory from './node-factory';

export function itRendersFootnoteCitationsDifferently(Component) {
  it('renders footnote citation differently', () => {
    const content = [{
      content_type: 'footnote_citation',
      footnote_node: { identifier: 'some_footnote' },
      text: '3',
    }];
    const docNode = nodeFactory({ content });
    const result = shallow(<Component docNode={docNode} />);

    const ft = result.find('FootnoteCitationInTable');
    expect(ft).toHaveLength(1);
    expect(ft.prop('content')).toEqual(content[0]);
  });
}

export function itUsesTheAppropriateTag(Component, tagName) {
  it('uses the appropriate tag', () => {
    const result = shallow(<Component docNode={nodeFactory()} />);
    expect(result.name()).toBe(tagName);
  });
}
