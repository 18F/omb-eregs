import {Schema} from "prosemirror-model";

const schema = new Schema({
  nodes: {
    doc: {
      content: 'paragraph+',
    },
    paragraph: {
      content: 'inline*',
      toDOM() { return ['p', 0]; },
    },
    text: {
      group: 'inline',
    },
  },
  marks: {},
});

export default schema;
