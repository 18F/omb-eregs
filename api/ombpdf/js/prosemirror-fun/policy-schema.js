import {Schema} from "prosemirror-model";
import {orderedList, bulletList, listItem} from "prosemirror-schema-list";

function add(obj, props) {
  let copy = {}
  for (let prop in obj) copy[prop] = obj[prop]
  for (let prop in props) copy[prop] = props[prop]
  return copy
}

export const nodes = {
  doc: {
    content: "section+",
  },

  paragraph: {
    content: 'inline*',
    toDOM() { return ['p', 0]; },
  },

  section: {
    content: 'heading? (ordered_list | bullet_list | paragraph | section | footnote | unimplemented_child)+',
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

  ordered_list: add(orderedList, {
    content: 'list_item+',
    attrs: {
      order: {default: 1},
      className: {default: ''},
    },
    toDOM(node) {
      return ["ol", {
        'start': node.attrs.order == 1 ? null : node.attrs.order,
        'class': node.attrs.className,
      }, 0]
    }
  }),

  bullet_list: add(bulletList, {
    content: 'list_item+',
  }),

  list_item: add(listItem, {
    content: '(ordered_list | bullet_list | paragraph | footnote | unimplemented_child)*',
  }),

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
