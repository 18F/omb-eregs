import { mount, shallow } from 'enzyme';
import React from 'react';

import FootnoteCitation from '../../components/content-renderers/footnote-citation';
import PlainText from '../../components/content-renderers/plain-text';
import { Document } from '../../pages/document';


describe('<Document />', () => {
  it('creates a Document for each node', () => {
    const docNode = {
      identifier: 'aaa_1',
      node_type: 'aaa',
      content: [],
      children: [
        {
          identifier: 'aaa_1__bbb_1',
          node_type: 'bbb',
          content: [],
          children: [],
        },
        {
          identifier: 'aaa_1__bbb_2',
          node_type: 'bbb',
          content: [],
          children: [],
        },
        {
          identifier: 'aaa_1__bbb_3',
          node_type: 'bbb',
          content: [],
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
      content: [],
      children: [
        {
          identifier: 'aaa_1__bbb_1',
          node_type: 'bbb',
          content: [],
          children: [
            {
              identifier: 'aaa_1__bbb_1__ccc_1',
              node_type: 'ccc',
              content: [],
              children: [
                {
                  identifier: 'aaa_1__bbb_1__ccc_1__ddd_1',
                  node_type: 'ddd',
                  content: [],
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
      content: [{ content_type: '__text__', text: 'Some content' }],
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
      content: [{ content_type: '__text__', text: 'Something' }],
      children: [],
    };
    const result = shallow(<Document docNode={docNode} />);
    expect(result.name()).toBe('Fallback');
    expect(result.prop('docNode')).toEqual(docNode);
  });
  it('renders the "content" field', () => {
    const docNode = {
      identifier: 'aaa_1',
      node_type: 'aaa',
      text: 'Some highlighted1 text here2',
      content: [
        { content_type: '__text__', text: 'Some highlighted' },
        {
          content_type: 'footnote_citation',
          footnote_node: 'aaa_1__footnote_1',
          text: '1',
        },
        { content_type: '__text__', text: ' text here' },
        {
          content_type: 'footnote_citation',
          footnote_node: 'aaa_1__bbb_2__footnote_2',
          text: '2',
        },
      ],
      children: [],
    };
    const doc = shallow(<Document docNode={docNode} />);
    const renderedContent = doc.prop('renderedContent');
    expect(renderedContent).toHaveLength(4);
    const [c0, c1, c2, c3] = renderedContent;
    expect(c0.type).toBe(PlainText);
    expect(c0.props.content).toEqual(docNode.content[0]);
    expect(c1.type).toBe(FootnoteCitation);
    expect(c1.props.content).toEqual(docNode.content[1]);
    expect(c2.type).toBe(PlainText);
    expect(c2.props.content).toEqual(docNode.content[2]);
    expect(c3.type).toBe(FootnoteCitation);
    expect(c3.props.content).toEqual(docNode.content[3]);
  });
});
