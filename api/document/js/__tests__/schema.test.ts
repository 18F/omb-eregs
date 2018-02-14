import { deleteSelection } from 'prosemirror-commands';
import { DOMSerializer } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

import pathToResolvedPos, { NthType } from '../path-to-resolved-pos';
import schema, { factory, listAttrs } from '../schema';

const serializer = DOMSerializer.fromSchema(schema);

describe('unimplementedNode', () => {
  it('includes the node type as text', () => {
    const node = factory.unimplementedNode({ node_type: 'something-unknown' });
    const result = serializer.serializeNode(node);
    expect(result.textContent).toBe('something-unknown');
  });

  it('falls back if no node type is present', () => {
    const node = factory.unimplementedNode({ bad: 'data' });
    const result = serializer.serializeNode(node);
    expect(result.textContent).toBe('[no-node-type]');
  });
});

describe('inlineFootnote', () => {
  it('is cool', () => {
    const node = schema.nodes.inlineFootnote.create({ emblem: 'boop' }, []);
    const result = serializer.serializeNode(node);
    expect(result.attributes.getNamedItem('data-emblem').value).toBe('boop');
  });
});

describe('heading', () => {
  [2, 3, 4, 5].forEach((depth) => {
    const hTag = `H${depth}`;

    it(`uses the ${hTag} tag`, () => {
      const node = factory.heading('Header', depth);
      const result = serializer.serializeNode(node);
      expect(result.nodeName).toBe(hTag);
    });
  });
});

describe('listAttrs()', () => {
  it('works with decimals', () => {
    const { markerPrefix, markerSuffix, numeralFn } = listAttrs('1.');
    expect(markerPrefix).toBe('');
    expect(markerSuffix).toBe('.');
    expect(numeralFn(0)).toBe('1');
    expect(numeralFn(3)).toBe('4');
    expect(numeralFn(25)).toBe('26');
  });

  it('works with parens', () => {
    const { markerPrefix, markerSuffix, numeralFn } = listAttrs('(a)');
    expect(markerPrefix).toBe('(');
    expect(markerSuffix).toBe(')');
    expect(numeralFn(0)).toBe('a');
    expect(numeralFn(8)).toBe('i');
    expect(numeralFn(25)).toBe('z');
    expect(numeralFn(26)).toBe('aa');
    expect(numeralFn(99)).toBe('vvvv');
  });

  it('works when a known character is not present', () => {
    const { markerPrefix, markerSuffix, numeralFn } = listAttrs('■');
    expect(markerPrefix).toBe('■');
    expect(markerSuffix).toBe('');
    expect(numeralFn(0)).toBe('');
    expect(numeralFn(7)).toBe('');
    expect(numeralFn(9999)).toBe('');
  });

  it('selects the *last* match', () => {
    const { markerPrefix, markerSuffix, numeralFn } = listAttrs('4.c.R.i');
    expect(markerPrefix).toBe('4.c.R.');
    expect(markerSuffix).toBe('');
    expect(numeralFn(0)).toBe('i');
    expect(numeralFn(7)).toBe('viii');
    expect(numeralFn(100)).toBe('ci');
  });
});
