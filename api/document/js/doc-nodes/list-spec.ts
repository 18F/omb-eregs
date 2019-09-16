import { Fragment, Node } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import * as repeatString from 'repeat-string';
import * as romanize from 'romanize';

import { ApiNode } from '../Api';
// Probably makes sense to move this fn
import { renumberList } from '../list-utils';
// These two would be recursive imports, but both should be resolved by the
// time we need them
import parseDoc from '../parse-doc';
import schema from '../schema';
import DocNodeSpec, { defaultSpec } from './DocNodeSpec';

function makeIntToLetter(initial: string) {
  const offset = initial.charCodeAt(0);

  return (idx: number) => {
    const count = Math.floor(idx / 26) + 1;
    const letter = String.fromCharCode(offset + idx % 26);
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
const lastMatch = new RegExp('^.*([aA1iI])[^aA1iI]*$', 'm');

export function deriveAttrs(toImitate: string) {
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

const listSpec: DocNodeSpec = {
  ...defaultSpec,
  attrs: {
    markerPrefix: { default: '●' },
    markerSuffix: { default: '' },
    numeralFn: { default: (idx: number) => '' },
  },
  content: 'listitem*',
  group: 'block',
  name: 'list',

  factory: (startMarker: string, children?: Node[] | Fragment) =>
    schema.nodes.list.create(deriveAttrs(startMarker), children || []),

  canFixup: (node: Node) => node.content.childCount === 0,
  fixup(transaction: Transaction, node: Node, pos: number) {
    const postDeletion = transaction.delete(pos, pos + node.nodeSize);
    return renumberList(postDeletion, pos);
  },

  parseApiNode(node: ApiNode) {
    let startMarker = '●';
    if (node.children.length) {
      startMarker = node.children[0].marker || startMarker;
    }
    return this.factory(
      startMarker,
      (node.children || []).map(parseDoc),
    );
  },

  toDOM: () => ['ol', { class: 'node-list' }, 0],
};

export default listSpec;
