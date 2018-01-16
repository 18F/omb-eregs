import { Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
      content: '(paragraph | unimplemented_node)+',
    },
    paragraph: {
      content: 'inline*',
      toDOM: () => ['p', 0],
    },
    text: {
      group: 'inline',
    },
    unimplemented_node: {
      content: 'inline*',
      atom: true,
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['div', { 'class': 'unimplemented' }, 0],
    },
  },
  marks: {
    unimplemented_content: {
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['span', { 'class': 'unimplemented' }],
    },
  },
});

export default schema;
