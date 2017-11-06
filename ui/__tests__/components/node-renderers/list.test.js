import { shallow } from 'enzyme';
import React from 'react';

import List from '../../../components/node-renderers/list';
import renderNode from '../../../util/render-node';

jest.mock(
  '../../../util/render-node',
  () => jest.fn((_, idx) => <child key={idx}>some child</child>),
);

describe('<List />', () => {
  const docNode = {
    children: [{ first: 'child' }, { second: 'child' }],
    identifier: 'aaa_1__bbb_2__ccc_3',
  };
  const result = shallow(<List docNode={docNode} />);
  it('includes the identifier', () => {
    expect(result.prop('id')).toBe('aaa_1__bbb_2__ccc_3');
  });
  it('includes children', () => {
    expect(result.text()).toMatch(/some child.*some child/);
    expect(result.find('child')).toHaveLength(2);
    expect(renderNode).toHaveBeenCalledTimes(2);
    expect(renderNode.mock.calls[0][0]).toEqual({ first: 'child' });
    expect(renderNode.mock.calls[1][0]).toEqual({ second: 'child' });
  });
});

