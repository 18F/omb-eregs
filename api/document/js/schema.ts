import { Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    inline: {
      content: 'text+',
      toDOM: () => ['p', 0],
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
  },
  marks: {
    unimplemented_content: {
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['span', { class: 'unimplemented' }],
    },
  },
});

export default schema;
