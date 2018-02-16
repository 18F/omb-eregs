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

// Given a position arbitrarily deep in the document hierarchy, find a
// following block node and return a position within it
function adjacentBlock(resolved: ResolvedPos): ResolvedPos | void {
  const blockDepth = walkUpUntil(resolved, n => n.type.spec.group === 'block');
  const posAfterBlock = resolved.after(blockDepth);
  const parentDepth = blockDepth - 1;
  if (parentDepth >= 0) {
    const parent = resolved.node(parentDepth);
    const blockIdxInParent = resolved.index(parentDepth);
    if (parent.childCount > blockIdxInParent + 1) {
      return resolved.doc.resolve(posAfterBlock + 1); // enter the new block
    }
  }
}

// Given a pos, find any adjacent, sequential lists. If the exist, collapse
// them, using the marker template from the first
export function collapseAdjacentLists(transaction: Transaction, pos: number): Transaction {
  let result = transaction;
  const resolved = result.doc.resolve(pos);
  const neighbor1 = adjacentBlock(resolved);
  const neighbor2 = adjacentBlock(neighbor1 || resolved);
  if (neighbor1 && neighbor1.parent.type === schema.nodes.list
      && neighbor2 && neighbor2.parent.type === schema.nodes.list) {
    const list2 = neighbor2.parent;
    result = result.delete(
      neighbor2.before(neighbor2.depth),
      neighbor2.after(neighbor2.depth),
    );
    result = result.insert(neighbor1.end(neighbor1.depth), list2.content);
    result = collapseAdjacentLists(result, pos);  // repeat
  }
  return result;
}

// If there's an adjacent list, renumber it based on the provided marker
// template.
export function renumberAdjacentList(
  transaction: Transaction,
  markerTemplate: string,
  pos: number,
): Transaction {
  let result = transaction;
  const resolved = transaction.doc.resolve(pos);
  const neighbor = adjacentBlock(resolved);
  if (neighbor && neighbor.parent.type === schema.nodes.list) {
    const startOfList = neighbor.start(neighbor.depth);
    result = result.replaceWith(
      neighbor.before(neighbor.depth),
      neighbor.after(neighbor.depth),
      factory.list(markerTemplate, neighbor.parent.content),
    );
    result = renumberList(result, startOfList);
    result = renumberSublists(result, startOfList);
  }
  return result;
}

// Helpful for testing. Assumes the first parameter is a list node
export function collectMarkers(list: Node): string[] {
  const result: string[] = [];
  list.content.forEach(li => result.push(li.attrs.marker));
  return result;
}
