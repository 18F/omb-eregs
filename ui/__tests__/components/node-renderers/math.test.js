import { mount } from 'enzyme';
import React from 'react';
import TeXMath, { texFromContents } from '../../../components/node-renderers/math';
import nodeFactory from '../../test-utils/node-factory';
import {
  itIncludesTheIdentifier,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<TeXMath />', () => {
  itIncludesTheIdentifier(TeXMath);
  it('generates something math-like', () => {
    const docNode = nodeFactory({
      content: [
        { content_type: '__text__', text: '\\frac{12345654321}{10987678901}' },
      ],
    });
    const result = mount(<TeXMath docNode={docNode} />);
    expect(result.render().find('span.katex')).toHaveLength(1);
    expect(result.text()).toContain('12345654321');
    expect(result.text()).toContain('10987678901');
  });
  it('generates inline links', () => {
    const docNode = nodeFactory({
      content: [
        { content_type: '__text__', text: '\\frac{top' },
        { content_type: 'footnote_citation',
          footnote_node: { identifier: 'some_1__footnote_2' },
          text: '14',
        },
        { content_type: '__text__', text: '}{bottom}' },
      ],
    });
    const html = mount(<TeXMath docNode={docNode} />).html();
    expect(html).toMatch(/<a/);
    expect(html).toMatch(/#some_1__footnote_2/);
  });
});

describe('texFromContents()', () => {
  it('renders both text and footnotes', () => {
    const contents = [
      { content_type: '__text__', text: 'Some prefix ' },
      { content_type: 'footnote_citation',
        footnote_node: { identifier: 'aaa_1__bbb_2' },
        text: '62',
      },
      { content_type: '__text__', text: ' suffix' },
    ];
    expect(texFromContents(contents)).toBe(
      // All underscores and the pound character need to be escaped in TeX
      'Some prefix ^{\\textit{[62](\\#aaa\\_1\\_\\_bbb\\_2)}} suffix');
  });
  it('renders footnote citations in tables differently', () => {
    const contents = [
      { content_type: 'footnote_citation',
        footnote_node: { identifier: 'aaa_1__bbb_2' },
        text: '62',
      },
    ];
    // All underscores and the pound character need to be escaped in TeX
    expect(texFromContents(contents)).toBe(
      '^{\\textit{[62](\\#aaa\\_1\\_\\_bbb\\_2)}}');
    expect(texFromContents(contents, true)).toBe(
      '^{\\textit{[62](\\#aaa\\_1\\_\\_bbb\\_2-table)}}');
  });
});
