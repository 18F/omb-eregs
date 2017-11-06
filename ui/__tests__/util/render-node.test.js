import FootnoteCitation from '../../components/content-renderers/footnote-citation';
import PlainText from '../../components/content-renderers/plain-text';
import Fallback from '../../components/node-renderers/fallback';
import Paragraph from '../../components/node-renderers/para';
import renderNode from '../../util/render-node';


describe('renderNode()', () => {
  it('uses para, etc.', () => {
    const docNode = {
      identifier: 'aaa_1__bbb_1__para_1',
      node_type: 'para',
      text: 'Some content',
      content: [{ content_type: '__text__', text: 'Some content' }],
      children: [],
    };
    const result = renderNode(docNode);
    expect(result.type).toBe(Paragraph);
    expect(result.props.docNode).toEqual(docNode);
  });
  it('uses the Fallback component for other nodes', () => {
    const docNode = {
      identifier: 'aaa_1__bbb_1',
      node_type: 'bbb',
      text: 'Something',
      content: [{ content_type: '__text__', text: 'Something' }],
      children: [],
    };
    const result = renderNode(docNode);
    expect(result.type).toBe(Fallback);
    expect(result.props.docNode).toEqual(docNode);
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
    const result = renderNode(docNode);
    const renderedContent = result.props.children;
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

