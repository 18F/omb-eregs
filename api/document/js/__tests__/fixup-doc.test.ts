import { EditorState } from 'prosemirror-state';

import { deleteEmpty } from '../fixup-doc';
import schema, { factory } from '../schema';

describe('deleteEmpty()', () => {
  it('deletes empty paragraphs', () => {
    const doc = factory.policy([
      factory.para('first'),
      schema.nodes.para.create({}, schema.nodes.inline.create()),
    ]);
    expect(doc.childCount).toBe(2);
    const state = EditorState.create({ doc });
    const transaction = deleteEmpty(state.tr);
    const modified = state.apply(transaction);

    expect(modified.doc.childCount).toBe(1);
    expect(modified.doc.textContent).toBe('first');
  });

  it('deletes empty listitems', () => {
    const doc = factory.policy([
      factory.list('1.', [
        factory.listitem('1.', [factory.para('First')]),
        factory.listitem('2.', []),
        factory.listitem('3.', [factory.para('Third')]),
      ]),
    ]);
    expect(doc.content.child(0).childCount).toBe(3);
    const state = EditorState.create({ doc });
    const transaction = deleteEmpty(state.tr);
    const modified = state.apply(transaction);

    expect(modified.doc.content.child(0).childCount).toBe(2);
    expect(modified.doc.content.child(0).textContent).toBe('FirstThird');
  });

  it('deletes empty lists', () => {
    const doc = factory.policy([
      factory.list('1.', []),
      factory.para('stuff'),
    ]);
    expect(doc.content.childCount).toBe(2);
    const state = EditorState.create({ doc });
    const transaction = deleteEmpty(state.tr);
    const modified = state.apply(transaction);

    expect(modified.doc.childCount).toBe(1);
    expect(modified.doc.textContent).toBe('stuff');
  });
  it('is recursive', () => {
    const doc = factory.policy([
      factory.para('Something'),
      factory.list('1. ', [
        factory.listitem('1. ', []),
        factory.listitem('2', [
          schema.nodes.para.create({}, schema.nodes.inline.create()),
        ]),
      ]),
      factory.para('tail'),
    ]);
    // First pass, we'll delete the first listitem (as it has no children)
    // Second pass, we'll delete the para
    // Then the second list item,
    // Then the whole list, which is now empty
    expect(doc.content.childCount).toBe(3);
    const state = EditorState.create({ doc });
    const transaction = deleteEmpty(state.tr);
    const modified = state.apply(transaction);

    expect(modified.doc.childCount).toBe(2);
    expect(modified.doc.textContent).toBe('Somethingtail');
  });
});
