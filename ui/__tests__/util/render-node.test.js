import Fallback from '../../components/node-renderers/fallback';
import Noop from '../../components/node-renderers/noop';
import Paragraph from '../../components/node-renderers/para';
import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';


describe('renderNode()', () => {
  it('uses para, etc.', () => {
    const docNode = new DocumentNode({
      identifier: 'aaa_1__bbb_1__para_1',
      node_type: 'para',
      text: 'Some content',
      content: [{ content_type: '__text__', text: 'Some content' }],
    });
    const result = renderNode(docNode);
    expect(result.type).toBe(Paragraph);
    expect(result.props.docNode).toEqual(docNode);
  });
  it('uses the Fallback component for other nodes', () => {
    const docNode = new DocumentNode({
      identifier: 'aaa_1__bbb_1',
      node_type: 'bbb',
      text: 'Something',
      content: [{ content_type: '__text__', text: 'Something' }],
    });
    const result = renderNode(docNode);
    expect(result.type).toBe(Fallback);
    expect(result.props.docNode).toEqual(docNode);
  });
  it('does not render preambles', () => {
    const docNode = new DocumentNode({
      identifier: 'aaa_1__preamble_1',
      node_type: 'preamble',
    });
    const result = renderNode(docNode);
    expect(result.type).toBe(Noop);
  });
});
