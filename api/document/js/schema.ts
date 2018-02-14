import { Node, NodeSpec, Schema } from 'prosemirror-model';

const listSchemaNodes: { [name: string]: NodeSpec } = {
  list: {
    content: 'listitem*',
    group: 'block',
    toDOM: () => ['ol', { class: 'node-list' }, 0],
  },
  listitem: {
    attrs: {
      marker: { default: '1.' },
    },
    content: 'block*',
    toDOM: node => [
      'li',
      { class: 'node-list-item' },
      ['span', { class: 'list-item-marker' }, node.attrs.marker],
      ['div', { class: 'list-item-text' }, 0],
    ],
  },
};

const schema = new Schema({
  topNode: 'policy',
  nodes: {
    policy: {
      content: 'block+',
    },
    paraText: {
      content: 'inline*',
      toDOM: () => ['p', { class: 'node-paragraph-text' }, 0],
    },
    inlineFootnote: {
      attrs: {
        emblem: {},
      },
      content: 'text*',
      group: 'inline',
      inline: true,
      toDOM: node => ['span', {
        class: 'inline-footnote',
        'data-emblem': node.attrs.emblem,
      }, 0],
    },
    heading: {
      content: 'text+',
      group: 'block',
      attrs: {
        depth: { default: 1 },
      },
      toDOM: node => [`h${node.attrs.depth}`, { class: 'node-heading' }, 0],
    },
    para: {
      content: 'paraText block*',
      group: 'block',
      toDOM: () => ['div', { class: 'node-paragraph' }, 0],
    },
    sec: {
      content: 'heading block+',
      group: 'block',
      toDOM: () => ['section', { class: 'node-section' }, 0],
    },
    text: {
      group: 'inline',
    },
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
    schema.nodes.listitem.create({ marker }, children || []),
  para: (textContent: string | Node[], children?: Node[]) =>
    schema.nodes.para.create({}, [schema.nodes.paraText.create(
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
