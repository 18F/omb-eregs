import { Node } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';

import { renumberList } from './list-utils';
import schema from './schema';

const shouldDeleteChecks = {
  list: (node: Node) => node.content.childCount === 0,
  listitem: (node: Node) => node.content.childCount === 0,
  para: (node: Node) => (
    node.content.childCount === 1 // Just the paraText
    && node.textContent === ''
  ),
};

export function deleteEmpty(transaction: Transaction) {
  let newTransaction;
  transaction.doc.descendants((node, pos) => {
    if (newTransaction) return false;

    const shouldDeleteCheck = shouldDeleteChecks[node.type.name];
    if (shouldDeleteCheck && shouldDeleteCheck(node)) {
      newTransaction = transaction.delete(pos, pos + node.nodeSize);
      if (node.type === schema.nodes.listitem) {
        newTransaction = renumberList(newTransaction, pos);
      }
      return false;
    }
    return true;
  });
  if (newTransaction) {
    const subTransaction = deleteEmpty(newTransaction);
    return subTransaction || newTransaction;
  }
  return newTransaction;
}

export default new Plugin({
  appendTransaction(transactions, oldState, newState) {
    if (oldState.doc !== newState.doc) {
      return deleteEmpty(newState.tr);
    }
  },
});
