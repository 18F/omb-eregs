import { deleteSelection } from 'prosemirror-commands';
import { DOMSerializer } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

import pathToResolvedPos, { NthType } from '../path-to-resolved-pos';
import schema, { factory } from '../schema';

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

describe('para', () => {
  it('can be deleted', () => {
    const doc = factory.policy([
      factory.para('1'),
      factory.para('2'),
    ]);
    expect(doc.content.childCount).toBe(2);
    // Selected the "2"
    const selection = new TextSelection(
      pathToResolvedPos(doc, [new NthType(1, 'para'), 'inline']),
      pathToResolvedPos(doc, [new NthType(1, 'para'), 'inline', 1]),
    );
    const state = EditorState.create({ doc, selection });
    const dispatch = jest.fn();

    deleteSelection(state, dispatch);
    const transaction = dispatch.mock.calls[0][0];
    const modifiedDoc = state.apply(transaction).doc;

    expect(modifiedDoc.content.childCount).toBe(1);
  });
});
