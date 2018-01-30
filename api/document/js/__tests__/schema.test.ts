import { DOMSerializer } from 'prosemirror-model';

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
