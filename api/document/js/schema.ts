import { NodeSpec, Schema } from 'prosemirror-model';

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
    unimplemented_node: {
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
    unimplemented_mark: {
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['span', { class: 'unimplemented' }],
    },
  },
});

export default schema;
