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
    content: 'heading? (list | paragraph | section | footnote | unimplemented_child)+',
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

  footnote: {
    content: 'inline*',
    attrs: {
      marker: {},
    },
    toDOM(node) {
      return ['p', {
        'class': 'footnote',
        'data-marker': node.attrs.marker,
      }, 0];
    },
  },

  list: {
    content: 'list_item+',
    toDOM() { return ["ol", 0]; },
  },

  list_item: {
    content: 'list_item_marker list_item_content',
    toDOM() { return ["li", 0]; },
  },

  list_item_marker: {
    content: 'inline*',
    toDOM() { return ['span', 0]; },
  },

  list_item_content: {
    content: '(list | paragraph | footnote | unimplemented_child)*',
    toDOM() { return ['div', {'class': 'list-item-content'}, 0]; },
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
  external_link: {
    attrs: {
      href: {},
    },
    inclusive: false,
    toDOM(node) { return ["a", node.attrs] },
  },
};

export const schema = new Schema({nodes, marks});

export default schema;
