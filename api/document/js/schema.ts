import { Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
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
      toDOM: () => ['section', 0],
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
