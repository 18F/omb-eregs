import { shallow } from 'enzyme';
import React from 'react';

import Fallback from '../../../components/node-renderers/fallback';
import renderNode from '../../../util/render-node';

jest.mock(
  '../../../util/render-node',
  () => jest.fn(() => <child key="1">some child</child>),
);

const ORIGINALENV = { ...process.env };
beforeEach(() => {
  process.env = {};
  renderNode.mockClear();
});
afterEach(() => {
  process.env = ORIGINALENV;
});

describe('<Fallback />', () => {
  const docNode = {
    children: [{ first: 'child' }],
    identifier: 'aaa_1__bbb_2',
  };
  it('includes text, children, id when not in dev mode', () => {
    const result = shallow(
      <Fallback docNode={docNode}>
        <span>Example content</span>
      </Fallback>);

    expect(result.text()).toMatch(/Example content.*some child/);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
    expect(result.prop('style')).toBeUndefined();
    expect(result.prop('title')).toBeUndefined();
    expect(result.find('span')).toHaveLength(1);
    expect(result.find('child')).toHaveLength(1);
    expect(renderNode).toHaveBeenCalledTimes(1);
    expect(renderNode.mock.calls[0][0]).toEqual({ first: 'child' });
  });
  it('includes that plus title text and a background when in dev mode', () => {
    process.env.NODE_ENV = 'development';
    const result = shallow(
      <Fallback docNode={docNode}>
        <span>Example content</span>
      </Fallback>);

    expect(result.text()).toMatch(/Example content.*some child/);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
    expect(result.prop('style')).toEqual({ backgroundColor: 'pink' });
    expect(result.prop('title')).toBe('aaa_1__bbb_2');
    expect(result.find('span')).toHaveLength(1);
    expect(result.find('child')).toHaveLength(1);
    expect(renderNode).toHaveBeenCalledTimes(1);
    expect(renderNode.mock.calls[0][0]).toEqual({ first: 'child' });
  });
});
