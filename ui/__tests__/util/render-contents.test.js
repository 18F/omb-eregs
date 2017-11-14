import FootnoteCitation from '../../components/content-renderers/footnote-citation';
import PlainText from '../../components/content-renderers/plain-text';
import renderContents from '../../util/render-contents';


describe('renderContents()', () => {
  it('uses the appropriate renderers', () => {
    const content = [
      { content_type: '__text__', text: 'Some highlighted' },
      {
        content_type: 'footnote_citation',
        footnote_node: { identifier: 'aaa_1__footnote_1' },
        text: '1',
      },
      { content_type: '__text__', text: ' text here' },
      {
        content_type: 'footnote_citation',
        footnote_node: { identifier: 'aaa_1__bbb_2__footnote_2' },
        text: '2',
      },
    ];
    const result = renderContents(content);
    expect(result).toHaveLength(4);
    const [c0, c1, c2, c3] = result;
    expect(c0.type).toBe(PlainText);
    expect(c0.props.content).toEqual(content[0]);
    expect(c1.type).toBe(FootnoteCitation);
    expect(c1.props.content).toEqual(content[1]);
    expect(c2.type).toBe(PlainText);
    expect(c2.props.content).toEqual(content[2]);
    expect(c3.type).toBe(FootnoteCitation);
    expect(c3.props.content).toEqual(content[3]);
  });

  it('allows renderers to be overridden', () => {
    const content = [{ content_type: 'footnote_citation', text: 'aaaa' }];
    const override = jest.fn();
    const result = renderContents(content, { footnote_citation: override });
    expect(result[0].type).toBe(override);
  });
});

