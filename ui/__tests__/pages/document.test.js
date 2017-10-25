import { mount, shallow } from 'enzyme';
import React from 'react';

import { Document } from '../../pages/document';


describe('<Document />', () => {
  it('creates a Document for each node', () => {
    const docNode = {
      identifier: 'aaa_1',
      node_type: 'aaa',
      children: [
        {
          identifier: 'aaa_1__bbb_1',
          node_type: 'bbb',
          children: [],
        },
        {
          identifier: 'aaa_1__bbb_2',
          node_type: 'bbb',
          children: [],
        },
        {
          identifier: 'aaa_1__bbb_3',
          node_type: 'bbb',
          children: [],
        },
      ],
    };
    const result = mount(<Document docNode={docNode} />);
    expect(result.find(Document)).toHaveLength(4);
  });
  it('handles recursion', () => {
    const docNode = {
      identifier: 'aaa_1',
      node_type: 'aaa',
      children: [
        {
          identifier: 'aaa_1__bbb_1',
          node_type: 'bbb',
          children: [
            {
              identifier: 'aaa_1__bbb_1__ccc_1',
              node_type: 'ccc',
              children: [
                {
                  identifier: 'aaa_1__bbb_1__ccc_1__ddd_1',
                  node_type: 'ddd',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = mount(<Document docNode={docNode} />);
    expect(result.find(Document)).toHaveLength(4);
    expect(result.find('Document > Document')).toHaveLength(3);
    expect(result.find('Document > Document > Document')).toHaveLength(2);
  });
  it('uses para, etc.', () => {
    const docNode = {
      identifier: 'aaa_1__bbb_1__para_1',
      node_type: 'para',
      text: 'Some content',
      children: [],
    };
    const result = shallow(<Document docNode={docNode} />);
    expect(result.name()).toBe('Paragraph');
    expect(result.prop('docNode')).toEqual(docNode);
  });
  it('uses the Fallback component for other nodes', () => {
    const docNode = {
      identifier: 'aaa_1__bbb_1',
      node_type: 'bbb',
      text: 'Something',
      children: [],
    };
    const result = shallow(<Document docNode={docNode} />);
    expect(result.name()).toBe('Fallback');
    expect(result.prop('docNode')).toEqual(docNode);
  });
});
