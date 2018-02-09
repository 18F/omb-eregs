import { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

import { JsonApi } from './Api';
import { deeperBullet } from './list-utils';
import pathToResolvedPos, { SelectionPath } from './path-to-resolved-pos';
import { factory } from './schema';
import serializeDoc from './serialize-doc';
import { walkUpUntil } from './util';

function safeDocCheck(doc: Node) {
  try {
    doc.check();
  } catch (e) {
    console.error('Doc no longer valid', e);
  }
}

// Append the provided element at the closest valid point after the user's
// cursor/"head" of the current selection. Then, move the cursor to select
// that element.
export function appendNearBlock(state, dispatch, element: Node, selectionPath: SelectionPath) {
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

export function appendParagraphNear(state, dispatch) {
  const element = factory.para(' ');
  return appendNearBlock(state, dispatch, element, ['inline']);
}

export function appendBulletListNear(state, dispatch) {
  const element = factory.list([
    factory.listitem(deeperBullet(state.selection.$head), [factory.para(' ')]),
  ]);
  return appendNearBlock(state, dispatch, element, ['listitem', 'para', 'inline']);
}

export function makeSave(api: JsonApi) {
  return async state => api.write(serializeDoc(state.doc));
}

export function makeSaveThenXml(api: JsonApi) {
  return async (state) => {
    await api.write(serializeDoc(state.doc));
    window.location.assign(`${window.location.href}/akn`);
  };
}
