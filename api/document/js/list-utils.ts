import { Node, ResolvedPos } from 'prosemirror-model';
import { TextSelection, Transaction } from 'prosemirror-state';
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
  const listDepth = walkUpUntil(pos, node => node.type === schema.nodes.list);
  if (listDepth >= 0) {
    const list = pos.node(listDepth);
    return bulletFollows[list.attrs.markerPrefix] || defaultBullet;
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

// After modifying the document, our original selection is no longer valid.
// However, it's very possible that those absolute positions are still
// accurate. This creates a new transaction that copies them from an original
function resetCursorPosition(transaction: Transaction, original: TextSelection): Transaction {
  return transaction.setSelection(TextSelection.create(
    transaction.doc,
    original.anchor,
    original.head,
  ));
}

// Given a pos at the beginning of a list, renumber all of its lis to match
// the template provided by the list.
export function renumberList(transaction: Transaction, pos: number): Transaction {
  let result = transaction;
  const resolved = transaction.doc.resolve(pos);
  if (resolved.parent.type !== schema.nodes.list) {
    throw new Error('renumberList must be called from the beginning of a list');
  }

  const originalSelection = transaction.selection;
  const list = resolved.parent;
  const template = (idx: number) => [
    list.attrs.markerPrefix,
    list.attrs.numeralFn(idx),
    list.attrs.markerSuffix,
  ].join('');
  const newLis: Node[] = [];
  list.content.forEach((li, _, idxInParent) =>
    newLis.push(factory.listitem(template(idxInParent), li.content)));
  const replaceStart = resolved.start(resolved.depth);

  result = result.replaceWith(
    replaceStart,
    replaceStart + resolved.parent.content.size,
    newLis,
  );
  return resetCursorPosition(result, originalSelection);
}

// Given a pos at the beginning of a list, ensure all of the _sublists_ have
// matching numbers. This will recursively destroy previous list markers
export function renumberSublists(transaction: Transaction, pos: number): Transaction {
  let result = transaction;
  let offset = pos;
  const originalSelection = transaction.selection;
  const resolved = result.doc.resolve(pos);
  const list = resolved.parent;
  const deeperMarker = list.attrs.numeralFn(0) ?
    deeperOrderedLi(resolved) :
    deeperBullet(resolved);
  list.content.forEach((li) => {
    offset += 1;  // Add one for entering the list item
    li.content.forEach((liChild) => {
      if (liChild.type === schema.nodes.list) {
        result = renumberSublist(result, liChild, offset, deeperMarker);
        result = resetCursorPosition(result, originalSelection);
      }
      offset += liChild.nodeSize;
    });
    offset += 1; // Add one for exiting the list item
  });
  return result;
}

// Inner-most collection of transactions for renumbering a sublist. Assumes
// offset points directly before sublist
function renumberSublist(
  transaction: Transaction,
  sublist: Node,
  offset: number,
  marker: string,
): Transaction {
  let result = transaction;
  result = result.replaceWith(
    offset,
    offset + sublist.nodeSize,
    factory.list(marker, sublist.content),
  );
  const startOfSublist = offset + 1;
  result = renumberList(result, startOfSublist);
  result = renumberSublists(result, startOfSublist);
  return result;
}

// Helpful for testing. Assumes the first parameter is a list node
export function collectMarkers(list: Node): string[] {
  const result: string[] = [];
  list.content.forEach(li => result.push(li.attrs.marker));
  return result;
}
