import { shallow } from 'enzyme';
import React from 'react';

import Fallback from '../../../components/node-renderers/fallback';

const ORIGINALENV = { ...process.env };
beforeEach(() => {
  process.env = {};
});
afterEach(() => {
  process.env = ORIGINALENV;
});

describe('<Fallback />', () => {
  it('includes text, children, id when not in dev mode', () => {
    const docNode = { identifier: 'aaa_1__bbb_2', text: 'An example' };
    const result = shallow(
      <Fallback docNode={docNode}>
        <span id="child">A child</span>
      </Fallback>);
    expect(result.text()).toMatch(/An example/);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
    expect(result.prop('style')).toBeUndefined();
    expect(result.prop('title')).toBeUndefined();
    expect(result.find('#child')).toHaveLength(1);
  });
  it('includes that plus title text and a background when in dev mode', () => {
    process.env.NODE_ENV = 'development';
    const docNode = { identifier: 'aaa_1__bbb_2', text: 'An example' };
    const result = shallow(
      <Fallback docNode={docNode}>
        <span id="child">A child</span>
      </Fallback>);
    expect(result.text()).toMatch(/An example/);
    expect(result.prop('id')).toBe('aaa_1__bbb_2');
    expect(result.prop('style')).toEqual({ backgroundColor: 'pink' });
    expect(result.prop('title')).toBe('aaa_1__bbb_2');
    expect(result.find('#child')).toHaveLength(1);
  });
});
