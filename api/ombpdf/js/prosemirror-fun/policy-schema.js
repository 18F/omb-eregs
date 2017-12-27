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
    content: 'heading? (paragraph | section | unimplemented_child)+',
    toDOM() { return ["section", 0]; },
  },

  heading: {
    content: 'inline*',
    // We're assuming the HTML5 outline algorithm here, even though
    // browsers may or may not actually implement it:
    //
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines#The_HTML5_outline_algorithm
    toDOM() { return ['h1', 0]; },
  },

  unimplemented_child: {
    content: 'inline*',
    atom: true,
    attrs: {
      data: {},
    },
    toDOM() { return ['div', {'class': 'unimplemented'}, 0]; },
  },

  unimplemented_content: {
    group: 'inline',
    inline: true,
    atom: true,
    attrs: {
      data: {},
      contentType: {},
    },
    toDOM(node) {
      return ['span', {
        'class': 'unimplemented',
        'data-content-type': node.attrs.contentType,
      }];
    },
  },

  text: {
    group: 'inline',
  },
};

export const marks = {
  footnote_citation: {
    toDOM() { return ['sup']; },
  },
};

export const schema = new Schema({nodes, marks});

export default schema;
