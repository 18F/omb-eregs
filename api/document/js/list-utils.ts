import { Node, ResolvedPos } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import * as repeatString from 'repeat-string';
import * as romanize from 'romanize';

import schema, { factory } from './schema';
import { walkUpUntil } from './util';

const defaultBullet = '●';
const bulletFollows = {
  '●': '○',
  '○': '■',
};

export function deeperBullet(pos: ResolvedPos): string {
  const liDepth = walkUpUntil(pos, node => node.type === schema.nodes.listitem);
  if (liDepth >= 0) {
    const parListItem = pos.node(liDepth);
    return bulletFollows[parListItem.attrs.marker] || defaultBullet;
  }
  return defaultBullet;
}

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
const lastMatch = new RegExp(/^.*([aA1iI])[^aA1iI]*$/, 'm');

export function createMarkerTemplate(toImitate: string) {
  const match = lastMatch.exec(toImitate);
  if (match) {
    const matchingChar = match[1];
    const prefixEnds = toImitate.lastIndexOf(matchingChar);
    return (idx: number) => (
      toImitate.substr(0, prefixEnds)
      + firstToMapper[matchingChar](idx)
      + toImitate.substr(prefixEnds + 1)
    );
  }
  return (marker: number) => toImitate;
}

export function renumberList(transaction: Transaction, pos: number): Transaction {
  const resolved = transaction.doc.resolve(pos);
  const listDepth = walkUpUntil(resolved, node => node.type === schema.nodes.list);
  if (listDepth >= 0) {
    const list = resolved.node(listDepth);
    const template = createMarkerTemplate(list.content.child(0).attrs.marker);
    const newLis: Node[] = [];
    list.content.forEach((li, _, idxInParent) =>
      newLis.push(factory.listitem(template(idxInParent), li.content)));
    const listSize = newLis.reduce((soFar, next) => soFar + next.nodeSize, 0);

    return transaction.replaceWith(
      resolved.start(listDepth),
      resolved.start(listDepth) + listSize,
      newLis,
    );
  }
  return transaction;
}

// Helpful for testing. Assumes the first parameter is a list node
export function collectMarkers(list: Node): string[] {
  const result: string[] = [];
  list.content.forEach(li => result.push(li.attrs.marker));
  return result;
}
