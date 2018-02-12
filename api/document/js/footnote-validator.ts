import { Node } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import schema from './schema';

export function validateFootnoteCitations(doc: Node): boolean {
  const citations = new Set<string>();
  const footnotes = new Set<string>();

  doc.descendants((node, pos, parent) => {
    node.marks.forEach((mark) => {
      if (mark.type === schema.marks.footnoteCitation) {
        if (!node.text) {
          throw new Error('Nodes with footnote citations must have text!');
        }
        citations.add(node.text);
      }
    });

    if (node.type === schema.nodes.footnote) {
      if (typeof node.attrs.emblem !== 'string') {
        throw new Error('Footnote nodes must have emblems!');
      }
      footnotes.add(node.attrs.emblem);
    }

    return true;
  });

  for (const citation of citations) {
    if (!footnotes.has(citation)) {
      return false;
    }
  }

  return true;
}

export default new Plugin({
  filterTransaction(tr): boolean {
    if (!tr.docChanged) {
      return true;
    }

    return validateFootnoteCitations(tr.doc);
  },
});
