import { Node, NodeSpec, Schema } from 'prosemirror-model';

const listSchemaNodes: { [name: string]: NodeSpec } = {
  list: {
    content: 'listitem+',
    group: 'block',
    toDOM: () => ['ol', { class: 'node-list' }, 0],
  },
  listitem: {
    content: 'listitemMarker listitemBody',
    toDOM: () => ['li', { class: 'node-list-item' }, 0],
  },
  listitemMarker: {
    content: 'text+',
    toDOM: () => ['span', { class: 'list-item-marker' }, 0],
  },
  listitemBody: {
    content: 'block+',
    toDOM: () => ['div', { class: 'list-item-text' }, 0],
  },
};

const schema = new Schema({
  topNode: 'policy',
  nodes: {
    policy: {
      content: 'block+',
    },
    inline: {
      content: 'text+',
      toDOM: () => ['p', { class: 'node-paragraph-text' }, 0],
    },
    heading: {
      content: 'text+',
      attrs: {
        depth: {}, // will hold the header depth
      },
      toDOM: node => [`h${node.attrs.depth}`, { class: 'node-heading' }, 0],
    },
    para: {
      content: 'inline? block*',
      group: 'block',
      toDOM: () => ['div', { class: 'node-paragraph' }, 0],
    },
    sec: {
      content: 'block+',
      group: 'block',
      toDOM: () => ['section', { class: 'node-section' }, 0],
    },
    text: {},
    unimplementedNode: {
      group: 'block',
      atom: true,
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM(node) {
        const nodeType = node.attrs.data.node_type || '[no-node-type]';
        return ['div', { class: 'unimplemented' }, nodeType];
      },
    },
    ...listSchemaNodes,
  },
  marks: {
    unimplementedMark: {
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['span', { class: 'unimplemented' }],
    },
  },
});

export const factory = {
  heading: (text: string, depth: number) =>
    schema.nodes.heading.create({ depth }, schema.text(text)),
  list: (children?: Node[]) =>
    schema.nodes.list.create({}, children || []),
  listitem: (marker: string, children?: Node[]) =>
    schema.nodes.listitem.create({}, [
      schema.nodes.listitemMarker.create({}, schema.text(marker)),
      schema.nodes.listitemBody.create({}, children || []),
    ]),
  para: (textContent: string | Node[], children?: Node[]) =>
    schema.nodes.para.create({}, [schema.nodes.inline.create(
      {},
      typeof textContent === 'string' ? schema.text(textContent) : textContent,
    )].concat(children || [])),
  policy: (children?: Node[]) =>
    schema.nodes.policy.create({}, children || []),
  sec: (children?: Node[]) =>
    schema.nodes.sec.create({}, children || []),
  unimplementedMark: (original: any) =>
    schema.marks.unimplementedMark.create({ data: original }),
  unimplementedNode: (original: any) =>
    schema.nodes.unimplementedNode.create({ data: original }),
};

export default schema;
