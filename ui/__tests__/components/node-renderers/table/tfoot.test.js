import { shallow } from 'enzyme';
import React from 'react';

import Tfoot from '../../../../components/node-renderers/table/tfoot';
import DocumentNode from '../../../../util/document-node';

describe('<Tfoot />', () => {
  it('is null if there are no footnotes', () => {
    const docNode = new DocumentNode({
      children: [],
      meta: { descendant_footnotes: [] },
    });
    const result = shallow(<Tfoot docNode={docNode} />);
    expect(result.type()).toBeNull();
  });
  it('calculates the correct colspan', () => {
    const docNode = new DocumentNode({
      children: [
        { node_type: 'caption', children: [] },
        { node_type: 'thead',
          children: [
            { node_type: 'tr',
              children: [
                { node_type: 'td', children: [] },
                { node_type: 'td', children: [] },
                { node_type: 'td', children: [] },
                { node_type: 'td', children: [] },
              ],
            },
          ],
        },
      ],
      meta: {
        descendant_footnotes: [{ identifier: '', marker: '', content: [] }],
      },
    });
    const result = shallow(<Tfoot docNode={docNode} />);
    expect(result.find('td').prop('colSpan')).toBe(4);
  });
  it('defaults to colspan="1"', () => {
    const docNode = new DocumentNode({
      children: [],
      meta: {
        descendant_footnotes: [{ identifier: '', marker: '', content: [] }],
      },
    });
    const result = shallow(<Tfoot docNode={docNode} />);
    expect(result.find('td').prop('colSpan')).toBe(1);
  });
  it('includes text in order', () => {
    const docNode = new DocumentNode({
      children: [],
      meta: {
        descendant_footnotes: [
          { content: [{ content_type: '__text__', text: 'aaa' }],
            identifier: 'footnote_1',
            marker: '1.',
          },
          { content: [{ content_type: '__text__', text: 'bbb' }],
            identifier: 'footnote_2',
            marker: '2!',
          },
          { content: [{ content_type: '__text__', text: 'ccc' }],
            identifier: 'footnote_3',
            marker: '3)',
          },
        ],
      },
    });
    const result = shallow(<Tfoot docNode={docNode} />);
    expect(result.text()).toMatch(/1\..*2!.*3\)/);
    const texts = result.find('PlainText');
    expect(texts).toHaveLength(3);
    expect(texts.at(0).prop('content').text).toBe('aaa');
    expect(texts.at(1).prop('content').text).toBe('bbb');
    expect(texts.at(2).prop('content').text).toBe('ccc');
  });
  it('includes a mangled version of the footnote identifier', () => {
    const docNode = new DocumentNode({
      children: [],
      meta: {
        descendant_footnotes: [
          { content: [], identifier: 'footnote_1', marker: '' },
        ],
      },
    });
    const result = shallow(<Tfoot docNode={docNode} />);
    expect(result.find('#footnote_1-table')).toHaveLength(1);
  });
});
