import Fallback from '../../components/node-renderers/fallback';
import Noop from '../../components/node-renderers/noop';
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
  it('does not render preambles', () => {
    const docNode = {
      identifier: 'aaa_1__preamble_1',
      node_type: 'preamble',
      text: '',
      content: [],
      children: [],
    };
    const result = renderNode(docNode);
    expect(result.type).toBe(Noop);
  });
});
