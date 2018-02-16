import { Node, ResolvedPos } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import schema, { factory, BEGIN_FOOTNOTE } from './schema';

import { walkUpUntil } from './util';

export function decrementFootnotesAfterPos(origTr: Transaction, pos: number): Transaction {
  let tr = origTr;

  origTr.doc.descendants((node, nodePos, parent) => {
    if (node.type === schema.nodes.inlineFootnote) {
      if (nodePos > pos) {
        tr = tr.setNodeMarkup(nodePos, undefined, {
          ...node.attrs,
          emblem: (parseInt(node.attrs.emblem, 10) - 1).toString(),
        });
      }
      return false;
    }
    return true;
  });

  return tr;
}

export function getEnclosingFootnoteDepth(pos: ResolvedPos): number {
  return walkUpUntil(pos, node => node.type === schema.nodes.inlineFootnote);
}

export function insertTextAfterFootnote(text: string, state: EditorState,
                                        pos: ResolvedPos): Transaction {
  const depth = getEnclosingFootnoteDepth(pos);
  const parent = pos.node(depth - 1);
  const end = pos.end(depth) + 1;
  let tr = state.tr.insertText(text, end);
  tr = tr.setSelection(TextSelection.create(tr.doc, end + text.length));
  return tr.scrollIntoView();
}

export function incrementFootnotesAfterPos(state: EditorState, pos: number): {
  tr: Transaction,
  absentEmblem: string,
} {
  let tr = state.tr;
  let latestEmblem = '0';
  let absentEmblem: string | undefined;

  // Note that this does NOT currently do anything with footnotes
  // contained in unimplementedNodes, which is bad, because it
  // generally means we won't be able to save the document after
  // this transaction is dispatched.

  state.doc.descendants((node, nodePos, parent) => {
    if (node.type === schema.nodes.inlineFootnote) {
      if (nodePos > pos) {
        if (!absentEmblem) {
          absentEmblem = node.attrs.emblem;
        }
        tr = tr.setNodeMarkup(nodePos, undefined, {
          ...node.attrs,
          emblem: (parseInt(node.attrs.emblem, 10) + 1).toString(),
        });
      } else {
        latestEmblem = node.attrs.emblem;
      }
      return false;
    }
    return true;
  });

  if (!absentEmblem) {
    absentEmblem = (parseInt(latestEmblem, 10) + 1).toString();
  }

  return { tr, absentEmblem };
}

export function createFootnoteNear(
  state: EditorState,
  pos: ResolvedPos,
): Transaction {
  const result = incrementFootnotesAfterPos(state, state.selection.$head.pos);

  const footnote = factory.inlineFootnote(result.absentEmblem, [
    schema.text(BEGIN_FOOTNOTE),
  ]);

  // Note that we do NOT yet consider the case where the given position isn't
  // hospitable to footnotes. We should find a nearby position that is.

  const tr = result.tr.insert(pos.pos, footnote);

  return tr;
}
