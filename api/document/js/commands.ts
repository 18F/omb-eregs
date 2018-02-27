import { Node, ResolvedPos } from 'prosemirror-model';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { JsonApi } from './Api';
import {
  collapseAdjacentLists,
  deeperBullet,
  deeperOrderedLi,
  renumberAdjacentList,
  renumberList,
  renumberSublists,
} from './list-utils';
import pathToResolvedPos, { SelectionPath } from './path-to-resolved-pos';
import schema, { factory } from './schema';
import serializeDoc from './serialize-doc';
import { walkUpUntil } from './util';

type Dispatch = (tr: Transaction) => void;

function safeDocCheck(doc: Node) {
  try {
    doc.check();
  } catch (e) {
    console.error('Doc no longer valid', e);
  }
}

// Set the cursor to highlight the full ProseMirror node (likely a text
// element)
function selectNode(transaction: Transaction, resolved: ResolvedPos): Transaction {
  return transaction.setSelection(TextSelection.create(
    transaction.doc,
    resolved.start(resolved.depth),
    resolved.end(resolved.depth),
  ));
}

// Append the provided element at the closest valid point after the user's
// cursor/"head" of the current selection. Then, move the cursor to select
// that element.
export function appendNearBlock(
  element: Node,
  selectionPath: SelectionPath,
  state: EditorState,
  dispatch?: Dispatch,
) {
  // Checking whether or not this action is possible
  if (!dispatch) {
    return true;
  }
  const pos = state.selection.$head;
  // Walk up the document until we hit a "block" element. We'll assume that
  // if there's one, there can be many (including a new para).
  const blockDepth = walkUpUntil(pos, node => node.type.spec.group === 'block');
  if (blockDepth >= 0) {
    const insertPos = pos.after(blockDepth);
    let tr = state.tr.insert(insertPos, element);
    const eltStart = pathToResolvedPos(
      tr.doc.resolve(insertPos + 1),
      selectionPath,
    );
    tr = selectNode(tr, eltStart);
    dispatch(tr.scrollIntoView());
    safeDocCheck(tr.doc);
  }

  return true;
}

export function appendParagraphNear(state: EditorState, dispatch?: Dispatch) {
  const element = factory.para(' ');
  return appendNearBlock(element, ['paraText'], state, dispatch);
}

export function appendBulletListNear(state: EditorState, dispatch?: Dispatch) {
  const startMarker = deeperBullet(state.selection.$head);
  const element = factory.list(
    startMarker,
    [factory.listitem(startMarker, [factory.para(' ')])],
  );
  return appendNearBlock(element, ['listitem', 'para', 'paraText'], state, dispatch);
}

export function appendOrderedListNear(state: EditorState, dispatch?: Dispatch) {
  const startMarker = deeperOrderedLi(state.selection.$head);
  const element = factory.list(
    startMarker,
    [factory.listitem(startMarker, [factory.para(' ')])],
  );
  return appendNearBlock(element, ['listitem', 'para', 'paraText'], state, dispatch);
}

// In many cases, we haven't implemented features for acting over spans of
// text (when selection's anchor and head are different). This function
// replaces the provided EditorState with one that's restricted to a single
// cursor.
export function restrictToCursor(state: EditorState): EditorState {
  const transaction = state.tr.setSelection(TextSelection.create(
    state.doc,
    state.selection.anchor,
  ));
  return state.apply(transaction);
}

type Command = (state: EditorState, dispatch?: Dispatch) => boolean;

// We want to inject some actions _after_ an upstream command; to do that,
// we'll wrap the Dispatch we give that fn to always call our logic before
// passing it along to the original
function appendToCommand(
  original: Command,
  appendLogic: (tr: Transaction) => Transaction,
): Command {
  return (state: EditorState, dispatch?: Dispatch) => {
    const wrappedDispatch: Dispatch = (tr: Transaction) => {
      if (dispatch) {
        const result = appendLogic(tr);
        dispatch(result);
      }
    };
    return original(state, wrappedDispatch);
  };
}

export function indentLi(state: EditorState, dispatch?: Dispatch) {
  const restrictedState = restrictToCursor(state);
  const upstreamFn = sinkListItem(schema.nodes.listitem);
  if (!dispatch) return upstreamFn(restrictedState, dispatch);

  const resolved = restrictedState.selection.$anchor;
  const listDepth = walkUpUntil(resolved, n => n.type === schema.nodes.list);
  if (listDepth < 0) return false;
  const startOfList = resolved.start(listDepth);

  const transform = appendToCommand(upstreamFn, (tr: Transaction) => {
    let result = tr;
    result = renumberList(result, startOfList);
    return renumberSublists(result, startOfList);
  });

  return transform(restrictedState, dispatch);
}

export function outdentLi(state: EditorState, dispatch?: Dispatch) {
  const restrictedState = restrictToCursor(state);
  const upstreamFn = liftListItem(schema.nodes.listitem);
  if (!dispatch) return upstreamFn(restrictedState, dispatch);

  const resolved = restrictedState.selection.$anchor;
  const listDepth = walkUpUntil(resolved, n => n.type === schema.nodes.list);
  if (listDepth < 0) return false;
  const { markerPrefix, markerSuffix, numeralFn } = resolved.node(listDepth).attrs;
  const listMarker = markerPrefix + numeralFn(0) + markerSuffix;
  const transform = appendToCommand(upstreamFn, (tr: Transaction) => {
    let result = tr;
    result = collapseAdjacentLists(result, result.selection.anchor);
    result = renumberAdjacentList(result, listMarker, result.selection.anchor);
    const newResolved = result.selection.$anchor;
    const newListDepth = walkUpUntil(newResolved, n => n.type === schema.nodes.list);
    if (newListDepth >= 0) {
      const startOfList = newResolved.start(newListDepth);
      result = renumberList(result, startOfList);
      result = renumberSublists(result, startOfList);
    }
    return result;
  });

  return transform(restrictedState, dispatch);
}

export function makeSave(api: JsonApi) {
  return async state => api.write(serializeDoc(state.doc));
}

export function makeSaveThenXml(api: JsonApi) {
  return async (state: EditorState) => {
    await api.write(serializeDoc(state.doc));
    window.location.assign(`${window.location.href}/akn`);
  };
}

const inLi = (pos: ResolvedPos) => (
  pos.depth >= 3
  && pos.node(pos.depth).type === schema.nodes.paraText
  && pos.node(pos.depth - 1).type === schema.nodes.para
  && pos.node(pos.depth - 2).type === schema.nodes.listitem
  && pos.node(pos.depth - 3).type === schema.nodes.list
);
function atEndOfLi(pos: ResolvedPos) {
  if (pos.depth < 2) return false;
  const endOfparaText = pos.end(pos.depth);
  const endOfPara = pos.end(pos.depth - 1);
  const endOfListItem = pos.end(pos.depth - 2);
  const paraTextAtEndOfPara = endOfparaText + 1 === endOfPara;
  const paraAtEndOfLi = endOfPara + 1 === endOfListItem;

  return pos.pos === endOfparaText && paraTextAtEndOfPara && paraAtEndOfLi;
}

export function addListItem(state: EditorState, dispatch?: Dispatch) {
  const resolved = state.selection.$head;
  if (!inLi(resolved) || !atEndOfLi(resolved)) {
    return false;
  }
  if (!dispatch) {
    return true;
  }

  // paraText < para < listitem < list
  const liDepth = resolved.depth - 2;
  const listDepth = liDepth - 1;
  const startOfList = resolved.start(listDepth);
  const insertPos = resolved.after(liDepth);
  // This marker will be replaced during the renumber step
  const liToInsert = factory.listitem('', [factory.para(' ')]);
  let tr = state.tr.insert(insertPos, liToInsert);
  tr = renumberList(tr, startOfList);
  tr = selectNode(tr, pathToResolvedPos(
    tr.doc.resolve(insertPos + 1),
    ['para', 'paraText'],
  ));
  tr = tr.scrollIntoView();
  dispatch(tr);
  return true;
}
