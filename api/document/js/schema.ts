import * as repeatString from 'repeat-string';
import * as romanize from 'romanize';

import { Fragment, Node, NodeSpec, Schema } from 'prosemirror-model';

// We use a zero-width space to begin footnotes, which allows
// editors to position the cursor at the beginning of a footnote,
// before its first character.
export const BEGIN_FOOTNOTE = '\u200b';

const listSchemaNodes: { [name: string]: NodeSpec } = {
  list: {
    attrs: {
      markerPrefix: { default: '●' },
      markerSuffix: { default: '' },
      numeralFn: { default: (idx: number) => '' },
    },
    content: 'listitem*',
    group: 'block',
    toDOM: () => ['ol', { class: 'node-list' }, 0],
  },
  listitem: {
    attrs: {
      marker: { default: '1.' },
    },
    content: 'block*',
    toDOM: node => [
      'li',
      { class: 'node-list-item' },
      ['span', { class: 'list-item-marker' }, node.attrs.marker],
      ['div', { class: 'list-item-text' }, 0],
    ],
  },
};

const schema = new Schema({
  topNode: 'policy',
  nodes: {
    policy: {
      content: 'block+',
    },
    paraText: {
      content: 'inline*',
      toDOM: () => ['p', { class: 'node-paragraph-text' }, 0],
    },
    inlineFootnote: {
      attrs: {
        emblem: { default: '1' },
      },
      content: 'text*',
      group: 'inline',
      inline: true,
      toDOM: node => ['span', {
        class: 'inline-footnote',
        'data-emblem': node.attrs.emblem,
      }, 0],
    },
    heading: {
      content: 'text+',
      group: 'block',
      attrs: {
        depth: { default: 1 },
      },
      toDOM: node => [`h${node.attrs.depth}`, { class: 'node-heading' }, 0],
    },
    para: {
      content: 'paraText block*',
      group: 'block',
      toDOM: () => ['div', { class: 'node-paragraph' }, 0],
    },
    sec: {
      content: 'heading block+',
      group: 'block',
      toDOM: () => ['section', { class: 'node-section' }, 0],
    },
    text: {
      group: 'inline',
    },
    unimplementedNode: {
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
    unimplementedMark: {
      attrs: {
        data: {}, // will hold unrendered content
      },
      toDOM: () => ['span', { class: 'unimplemented' }],
    },
  },
});

function makeIntToLetter(initial: string) {
  const offset = initial.charCodeAt(0);
  const alphabetLen = 26;

  return (idx: number) => {
    const count = Math.floor(idx / alphabetLen) + 1;
    const letter = String.fromCharCode(offset + idx % alphabetLen);
    return repeatString(letter, count);
  };
}

const firstToMapper = {
  'a': makeIntToLetter('a'),
  'A': makeIntToLetter('A'),
  // our input will be zero indexed
  '1': (idx: number) => `${idx + 1}`,
  'i': (idx: number) => romanize(idx + 1).toLowerCase(),
  'I': (idx: number) => romanize(idx + 1),
};
const lastMatch = new RegExp(/^.*([aA1iI])[^aA1iI]*$/, 'm');

export function listAttrs(toImitate: string) {
  const match = lastMatch.exec(toImitate);
  if (match) {
    const matchingChar = match[1];
    const prefixEnds = toImitate.lastIndexOf(matchingChar);
    return {
      markerPrefix: toImitate.substr(0, prefixEnds),
      markerSuffix: toImitate.substr(prefixEnds + 1),
      numeralFn: firstToMapper[matchingChar],
    };
  }
  return {
    markerPrefix: toImitate,
    markerSuffix: '',
    numeralFn: (idx: number) => '',
  };
}

export const factory = {
  heading: (text: string, depth: number) =>
    schema.nodes.heading.create({ depth }, schema.text(text)),
  inlineFootnote: (emblem: string, children: Node[] | Fragment) =>
    schema.nodes.inlineFootnote.create({ emblem }, children),
  list: (startMarker: string, children?: Node[] | Fragment) =>
    schema.nodes.list.create(listAttrs(startMarker), children || []),
  listitem: (marker: string, children?: Node[] | Fragment) =>
    schema.nodes.listitem.create({ marker }, children || []),
  para: (textContent: string | Node[], children?: Node[]) =>
    schema.nodes.para.create({}, [schema.nodes.paraText.create(
      {},
      typeof textContent === 'string' ? schema.text(textContent) : textContent,
    )].concat(children || [])),
  policy: (children?: Node[] | Fragment) =>
    schema.nodes.policy.create({}, children || []),
  sec: (children?: Node[] | Fragment) =>
    schema.nodes.sec.create({}, children || []),
  unimplementedMark: (original: any) =>
    schema.marks.unimplementedMark.create({ data: original }),
  unimplementedNode: (original: any) =>
    schema.nodes.unimplementedNode.create({ data: original }),
};

export default schema;
