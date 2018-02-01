import { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

import Api from './Api';
import { factory } from './schema';
import serializeDoc from './serialize-doc';

function safeDocCheck(doc: Node) {
  try {
    doc.check();
  } catch (e) {
    console.error('Doc no longer valid', e);
  }
}

// Appends a mostly-empty `para` in the closest valid point after the user's
// cursor/head of the current selection.
export function appendParagraphNear(state, dispatch) {
  // Checking whether or not this action is possible
  if (!dispatch) {
    return true;
  }
  const pos = state.selection.$head;
  let depth = pos.depth;
  // Walk up the document until we hit a "block" element. We'll assume that
  // if there's one, there can be many (including a new para).
  while (depth >= 0) {
    const node = pos.node(depth);
    if (node.type.spec.group === 'block') {
      const insertPos = pos.after(depth);
      let tr = state.tr.insert(insertPos, factory.para(' '));
      // + 2 to get us inside the inline
      tr = tr.setSelection(TextSelection.create(tr.doc, insertPos + 2));
      dispatch(tr.scrollIntoView());
      safeDocCheck(tr.doc);
      return true;
    }
    depth -= 1;
  }

  return true;
}

export function makeSave(api: Api) {
  return async state => api.write(serializeDoc(state.doc));
}
