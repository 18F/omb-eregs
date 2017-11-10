import { mount } from 'enzyme';
import React from 'react';
import TeXMath from '../../../components/node-renderers/math';
import {
  itIncludesTheIdentifier,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<TeXMath />', () => {
  itIncludesTheIdentifier(TeXMath, { text: 'abcd' });
  it('generates something math-like', () => {
    const docNode = {
      identifier: 'aaa_1__bbb_2__ccc_3_math',
      text: '\\frac{10}{11}',
    };
    const result = mount(<TeXMath docNode={docNode} />);
    expect(result.render().find('span.katex')).toHaveLength(1);
    expect(result.html()).toContain('10');
    expect(result.html()).toContain('11');
  });
});

