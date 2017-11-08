import { shallow } from 'enzyme';
import React from 'react';
import renderNode from '../../util/render-node';

export function itIncludesTheIdentifier(Component, extraAttrs) {
  it('includes the identifier', () => {
    const docNode = {
      children: [],
      identifier: 'aaa_1__bbb_2__ccc_3',
      marker: '',
      ...(extraAttrs || {}),
    };
    const result = shallow(<Component docNode={docNode} />);
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
}

export function itIncludesNodeText(Component, extraAttrs) {
  it('includes node text', () => {
    const docNode = {
      children: [],
      identifier: '',
      marker: '',
      ...(extraAttrs || {}),
    };
    const result = shallow(
      <Component docNode={docNode}>
        <span id="some-contents">Textextext</span>
      </Component>);
    expect(result.text()).toMatch(/Textextext/);
    const content = result.find('#some-contents');
    expect(content).toHaveLength(1);
    expect(content.name()).toBe('span');
    expect(content.text()).toBe('Textextext');
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

    const docNode = {
      children: [
        { children: [], node_type: 'first-child' },
        { children: [], node_type: 'second-child' },
      ],
      identifier: '',
      marker: '',
      ...(extraAttrs || {}),
    };
    const result = shallow(<Component docNode={docNode} />);
    expect(result.text()).toMatch(/first child.*second child/);
    expect(result.find('child')).toHaveLength(2);
    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode.mock.calls[0][0].node_type).toEqual('first-child');
    expect(renderNode.mock.calls[1][0].node_type).toEqual('second-child');
  });
}
