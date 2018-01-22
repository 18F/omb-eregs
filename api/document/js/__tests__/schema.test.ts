import { DOMSerializer } from 'prosemirror-model';

import schema from '../schema';

const serializer = DOMSerializer.fromSchema(schema);

describe('unimplemented_node', () => {
  it('includes the node type as text', () => {
    const node = schema.nodes.unimplemented_node.create({
      data: { node_type: 'something-unknown' },
    });
    const result = serializer.serializeNode(node);
    expect(result.textContent).toBe('something-unknown');
  });

  it('falls back if no node type is present', () => {
    const node = schema.nodes.unimplemented_node.create({
      data: { bad: 'data' },
    });
    const result = serializer.serializeNode(node);
    expect(result.textContent).toBe('[no-node-type]');
  });
});

describe('heading', () => {
  [2, 3, 4, 5].forEach(depth => {
    const hTag = `H${depth}`;

    it(`uses the ${hTag} tag`, () => {
      const node = schema.nodes.heading.create({ depth });
      const result = serializer.serializeNode(node);
      expect(result.nodeName).toBe(hTag);
    });
  });
});
