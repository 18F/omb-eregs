import {Schema} from "prosemirror-model";

export const nodes = {
  doc: {
    content: "section+",
  },

  paragraph: {
    content: 'inline*',
    toDOM() { return ['p', 0]; },
  },

  section: {
    content: 'heading? paragraph+',
    toDOM() { return ["section", {'class': 'doc-section'}, 0]; },
  },

  heading: {
    content: 'inline*',
    // We're assuming the HTML5 outline algorithm here, even though
    // browsers may or may not actually implement it:
    //
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines#The_HTML5_outline_algorithm
    toDOM() { return ['h1', 0]; },
  },

  text: {
    group: 'inline',
  },
};

export const marks = {};

export const schema = new Schema({nodes, marks});

export default schema;
