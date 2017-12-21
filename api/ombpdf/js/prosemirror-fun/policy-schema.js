import {Schema} from "prosemirror-model";

export const nodes = {
  doc: {
    content: "block+",
  },

  paragraph: {
    content: 'inline*',
    group: 'block',
    toDOM() { return ['p', 0]; },
  },

  section: {
    content: 'block+',
    toDOM() { return ["div", 0]; },
  },

  text: {
    group: 'inline',
  },
};

export const marks = {};

export const schema = new Schema({nodes, marks});

export default schema;
