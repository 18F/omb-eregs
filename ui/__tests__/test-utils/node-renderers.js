import { shallow } from 'enzyme';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

export function itIncludesTheIdentifier(Component, extraAttrs) {
  it('includes the identifier', () => {
    const docNode = new DocumentNode({
      identifier: 'aaa_1__bbb_2__ccc_3',
      ...(extraAttrs || {}),
    });
    const result = shallow(<Component docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
}

export function itIncludesNodeText(Component, extraAttrs) {
  it('includes node text', () => {
    const docNode = new DocumentNode({
      content: [
        { content_type: '__text__', text: 'Textextext' },
        { content_type: '__text__', text: 'Moreoreore' },
      ],
      ...(extraAttrs || {}),
    });
    const result = shallow(<Component docNode={docNode} />);
    const plainTexts = result.find('PlainText');
    expect(plainTexts).toHaveLength(2);
    expect(plainTexts.first().prop('content')).toEqual(docNode.content[0]);
    expect(plainTexts.last().prop('content')).toEqual(docNode.content[1]);
  });
}

export function itRendersChildNodes(Component, extraAttrs) {
  it('renders child nodes', () => {
    // renderNode must be mocked
    expect(renderNode.mock).not.toBeUndefined();
    renderNode.mockClear();
    renderNode.mockImplementationOnce(
      () => <child key="1">first child</child>);
    renderNode.mockImplementationOnce(
      () => <child key="2">second child</child>);

    const docNode = new DocumentNode({
      children: [
        { children: [], node_type: 'first_child' },
        { children: [], node_type: 'second_child' },
      ],
      ...(extraAttrs || {}),
    });
    const result = shallow(<Component docNode={docNode} />);
    expect(result.text()).toMatch(/first child.*second child/);
    expect(result.find('child')).toHaveLength(2);
    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode.mock.calls[0][0].nodeType).toEqual('first_child');
    expect(renderNode.mock.calls[1][0].nodeType).toEqual('second_child');
  });
}
