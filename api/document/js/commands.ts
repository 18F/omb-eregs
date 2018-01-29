import { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

import { factory } from './schema';

export function addParagraph(state, dispatch) {
  if (!dispatch) {
    return true;
  }
  const pos = state.selection.$head;
  let depth = pos.depth;
  while (depth >= 0) {
    const node = pos.node(depth);
    if (node.type.spec.group === 'block') {
      const insertPos = pos.after(depth);
      let tr = state.tr.insert(insertPos, factory.para(' '));
      // + 2 to get us inside the inline
      tr = tr.setSelection(TextSelection.create(tr.doc, insertPos + 2));
      dispatch(tr.scrollIntoView());
      return true;
    }
    depth -= 1;
  }

  return true;
}
