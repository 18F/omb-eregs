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
const defaultOrdered = '1.';
const orderedFollows = {
  'a': 'i',
  'A': 'I',
  '1': 'a',
  'i': '1',
  'I': '1',
};

export function deeperBullet(pos: ResolvedPos): string {
  const liDepth = walkUpUntil(pos, node => node.type === schema.nodes.listitem);
  if (liDepth >= 0) {
    const parListItem = pos.node(liDepth);
    return bulletFollows[parListItem.attrs.marker] || defaultBullet;
  }
  return defaultBullet;
}

export function deeperOrderedLi(pos: ResolvedPos): string {
  const listDepth = walkUpUntil(pos, node => node.type === schema.nodes.list);
  if (listDepth >= 0) {
    const list = pos.node(listDepth);
    const firstMarker = list.attrs.numeralFn(0);
    if (firstMarker in orderedFollows) {
      return [
        list.attrs.markerPrefix,
        orderedFollows[firstMarker],
        list.attrs.markerSuffix,
      ].join('');
    }
  }
  return defaultOrdered;
}

export function renumberList(transaction: Transaction, pos: number): Transaction {
  const resolved = transaction.doc.resolve(pos);
  const listDepth = walkUpUntil(resolved, node => node.type === schema.nodes.list);
  if (listDepth >= 0) {
    const list = resolved.node(listDepth);
    const template = (idx: number) => [
      list.attrs.markerPrefix,
      list.attrs.numeralFn(idx),
      list.attrs.markerSuffix,
    ].join('');
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
