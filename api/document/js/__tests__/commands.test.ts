jest.mock('../Api');
jest.mock('../serialize-doc');

import { EditorState, TextSelection } from 'prosemirror-state';

import Api from '../Api';
import { appendParagraphNear, makeSave } from '../commands';
import schema, { factory } from '../schema';
import serializeDoc from '../serialize-doc';

function executeTransform(initialState: EditorState, transform): EditorState {
  const dispatch = jest.fn();

  transform(initialState, dispatch);
  const transaction = dispatch.mock.calls[0][0];
  return initialState.apply(transaction);
}


describe('appendParagraphNear()', () => {
  it('adds a paragraph after the current', () => {
    const doc = factory.policy([
      factory.para('aaa'),
      factory.para('bbb'),
      factory.para('ccc'),
    ]);
    // Inside the 'bbb' paragraph
    const selection = new TextSelection(doc.resolve(11));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, appendParagraphNear).doc;

    expect(modifiedDoc.content.childCount).toBe(4);
    const texts: string[] = [];
    modifiedDoc.content.forEach((child) => {
      expect(child.type).toBe(schema.nodes.para);
      texts.push(child.textContent);
    });
    expect(texts).toEqual(['aaa', 'bbb', ' ', 'ccc']);
  });

  it('inserts at the right layer of nesting', () => {
    const doc = factory.policy([
      factory.para('aaa', [
        factory.para('subpar'),
        factory.unimplementedNode({}),
      ]),
    ]);
    // Inside the 'subpar' paragraph
    const selection = new TextSelection(doc.resolve(12));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, appendParagraphNear).doc;

    expect(modifiedDoc.content.childCount).toBe(1);
    const parA = modifiedDoc.content.child(0);
    expect(parA.content.childCount).toBe(4); // inline + 3 children
    expect(parA.content.child(2).textContent).toBe(' ');
  });

  it('skips over children', () => {
    const doc = factory.policy([
      factory.para('aaa', [
        factory.para('subpar'),
        factory.unimplementedNode({}),
      ]),
    ]);
    // Inside the 'aaa' paragraph
    const selection = new TextSelection(doc.resolve(4));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, appendParagraphNear).doc;

    expect(modifiedDoc.content.childCount).toBe(2);
    expect(modifiedDoc.content.child(1).textContent).toBe(' ');
  });

  it('puts the cursor in the right place', () => {
    const doc = factory.policy([
      factory.para('aaa'),
      factory.para('bbb'),
      factory.para('ccc'),
    ]);
    // Inside the 'bbb' paragraph
    const selection = new TextSelection(doc.resolve(11));
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, appendParagraphNear);

    const resolvedPos = modified.selection.$anchor;
    expect(resolvedPos.depth).toBe(2);
    expect(resolvedPos.parent.type).toBe(schema.nodes.inline);
    expect(resolvedPos.parent).toBe(
      modified.doc.content.child(2).content.child(0));
  });
});

describe('makeSave()', () => {
  it('calls the save function', async () => {
    (serializeDoc as any).mockImplementationOnce(() => ({ serialized: 'content' }));

    const api = new Api({ contentType: '', csrfToken: '', url: '' });
    const save = makeSave(api);
    await save({ doc: 'stuff' });

    expect(serializeDoc).toBeCalledWith('stuff');
    expect(api.write).toBeCalledWith({ serialized: 'content' });
  });
});
