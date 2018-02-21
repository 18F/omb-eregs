import { Node, ResolvedPos } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { JsonApi } from './Api';
import { deeperBullet, deeperOrderedLi, renumberList } from './list-utils';
import pathToResolvedPos, { SelectionPath } from './path-to-resolved-pos';
import schema, { factory, BEGIN_FOOTNOTE } from './schema';
import serializeDoc from './serialize-doc';
import { walkUpUntil } from './util';
import {
  getEnclosingFootnoteDepth,
  insertTextAfterFootnote,
  createFootnoteNear,
} from './footnote-utils';
import { Editor } from 'codemirror';

type Dispatch = (tr: Transaction) => void;

function safeDocCheck(doc: Node) {
  try {
    doc.check();
  } catch (e) {
    console.error('Doc no longer valid', e);
  }
}

export function isFootnoteActive(state: EditorState): boolean {
  return getEnclosingFootnoteDepth(state.selection.$head) >= 0;
}

export function toggleOrCreateFootnote(state: EditorState, dispatch: Dispatch) {
  const pos = state.selection.$head;
  const footnoteDepth = getEnclosingFootnoteDepth(pos);
  let tr;
  if (footnoteDepth >= 0) {
    tr = insertTextAfterFootnote(' ', state, pos);
  } else {
    tr = createFootnoteNear(state, pos);
  }
  safeDocCheck(tr.doc);
  dispatch(tr);
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
    const eltEnd = eltStart.pos + eltStart.parent.nodeSize - 1; // inclusive
    tr = tr.setSelection(TextSelection.create(
      tr.doc,
      eltStart.pos,
      eltEnd,
    ));
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
  const pos = state.selection.$head;
  if (!inLi(pos) || !atEndOfLi(pos)) {
    return false;
  }
  if (!dispatch) {
    return true;
  }

  const endOfLi: number = pos.end(pos.depth - 2); // paraText < para < li
  const insertPos = endOfLi + 1;
  // This marker will be replaced during the renumber step
  const liToInsert = factory.listitem('', [factory.para(' ')]);
  let tr = state.tr.insert(insertPos, liToInsert);
  tr = renumberList(tr, insertPos);
  const cursorStart = pathToResolvedPos(
    tr.doc.resolve(insertPos + 1),
    ['para', 'paraText'],
  ).pos;
  tr = tr.setSelection(TextSelection.create(
    tr.doc,
    cursorStart,
    cursorStart + 1, // select the space
  ));
  tr = tr.scrollIntoView();
  dispatch(tr);
  return true;
}
