jest.mock('../Api');
jest.mock('../serialize-doc');
window.location.assign = jest.fn();

import { Node } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

import { JsonApi } from '../Api';
import {
  addListItem,
  appendBulletListNear,
  appendNearBlock,
  appendParagraphNear,
  indentLi,
  outdentLi,
  makeSave,
  makeSaveThenXml,
} from '../commands';
import { collectMarkers } from '../list-utils';
import schema, { factory } from '../schema';
import serializeDoc from '../serialize-doc';
import pathToResolvedPos, { NthType, SelectionPath } from '../path-to-resolved-pos';

function executeTransform(initialState: EditorState, transform): EditorState {
  const dispatch = jest.fn();

  transform(initialState, dispatch);
  const transaction = dispatch.mock.calls[0][0];
  return initialState.apply(transaction);
}


describe('appendNearBlock()', () => {
  const paraTransform = (state, dispatch) =>
    appendNearBlock(factory.para(' '), ['paraText'], state, dispatch);

  it('adds a node after the current', () => {
    const doc = factory.policy([
      factory.para('aaa'),
      factory.para('bbb'),
      factory.para('ccc'),
    ]);
    const selection = new TextSelection(pathToResolvedPos(
      doc,
      // Inside the 'bbb' paragraph
      [new NthType(1, 'para'), 'paraText', 'b'.length],
    ));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, paraTransform).doc;

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
    const selection = new TextSelection(pathToResolvedPos(
      doc,
      // Inside the 'subpar' paragraph
      ['para', 'para', 'paraText', 'sub'.length],
    ));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, paraTransform).doc;

    expect(modifiedDoc.content.childCount).toBe(1);
    const parA = modifiedDoc.content.child(0);
    expect(parA.content.childCount).toBe(4); // paraText + 3 children
    expect(parA.content.child(2).textContent).toBe(' ');
  });

  it('skips over children', () => {
    const doc = factory.policy([
      factory.para('aaa', [
        factory.para('subpar'),
        factory.unimplementedNode({}),
      ]),
    ]);
    const selection = new TextSelection(pathToResolvedPos(
      doc,
      // Inside the 'aaa' paragraph
      ['para', 'paraText', 'a'.length],
    ));
    const state = EditorState.create({ doc, selection });
    const modifiedDoc = executeTransform(state, paraTransform).doc;

    expect(modifiedDoc.content.childCount).toBe(2);
    expect(modifiedDoc.content.child(1).textContent).toBe(' ');
  });
});

describe('appendParagraphNear()', () => {
  const doc = factory.policy([factory.para('aaa')]);
  const selection = new TextSelection(pathToResolvedPos(
    doc,
    ['para', 'paraText', 'a'.length],
  ));
  const state = EditorState.create({ doc, selection });
  const modified = executeTransform(state, appendParagraphNear);

  it('adds a paragraph', () => {
    expect(modified.doc.content.childCount).toBe(2);
    const texts: string[] = [];
    modified.doc.content.forEach((child) => {
      expect(child.type).toBe(schema.nodes.para);
      texts.push(child.textContent);
    });
    expect(texts).toEqual(['aaa', ' ']);
  });

  it('puts the cursor in the right place', () => {
    const resolvedPos = modified.selection.$anchor;
    expect(resolvedPos.depth).toBe(2);  // 0: policy, 1: para, 2: paraText
    expect(resolvedPos.parent.type).toBe(schema.nodes.paraText);
    expect(resolvedPos.parent).toBe(
      modified.doc.content.child(1).content.child(0));
  });
});

describe('appendBulletListNear()', () => {
  const doc = factory.policy([factory.para('aaa')]);
  const selection = new TextSelection(pathToResolvedPos(
    doc,
    ['para', 'paraText', 'a'.length],
  ));
  const state = EditorState.create({ doc, selection });
  const modified = executeTransform(state, appendBulletListNear);

  it('adds a list, listitem, and para', () => {
    expect(modified.doc.content.childCount).toBe(2);

    const list = modified.doc.content.child(1);
    expect(list.type).toBe(schema.nodes.list);
    expect(list.content.childCount).toBe(1);

    const li = list.content.child(0);
    expect(li.type).toBe(schema.nodes.listitem);
    expect(li.content.childCount).toBe(1);

    const para = li.content.child(0);
    expect(para.type).toBe(schema.nodes.para);
    expect(para.textContent).toBe(' ');
  });

  it('puts the cursor in the right place', () => {
    const resolvedPos = modified.selection.$anchor;
    // 0: policy, 1: list, 2: listitem, 3: para, 4: paraText
    expect(resolvedPos.depth).toBe(4);
    expect(resolvedPos.parent.type).toBe(schema.nodes.paraText);
    expect(resolvedPos.parent).toBe(
      modified.doc.content.child(1).content.child(0).content.child(0).content.child(0));
  });
});

describe('indentLi()', () => {
  const doc = factory.policy([
    factory.para('Intro'),
    factory.list('1.', [
      factory.listitem('1.', [factory.list('a.', [
        factory.listitem('a.', []),
        factory.listitem('b.', []),
      ])]),
      factory.listitem('2.', [factory.list('a.', [
        factory.listitem('a.', []),
      ])]),
    ]),
  ]);
  const inIntro = pathToResolvedPos(doc, ['para', 'paraText']);
  const at1 = pathToResolvedPos(doc, ['list', 'listitem']);
  const ata = pathToResolvedPos(doc, ['list', 'listitem', 'list', 'listitem']);
  const atb = pathToResolvedPos(
    doc,
    ['list', 'listitem', 'list', new NthType(1, 'listitem')],
  );
  const at2 = pathToResolvedPos(doc, ['list', new NthType(1, 'listitem')]);

  it('must be at an indentable li', () => {
    [inIntro, at1, ata].forEach((resolved) => {
      const selection = new TextSelection(resolved);
      const state = EditorState.create({ doc, selection });
      expect(indentLi(state)).toBe(false);
      expect(indentLi(state, jest.fn())).toBe(false);
    });
  });

  it('indents the li at the current cursor', () => {
    const selection = new TextSelection(atb);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, indentLi);
    const subsublist = pathToResolvedPos(
      modified.doc,
      ['list', 'listitem', 'list', 'listitem', 'list'],
    ).parent;
    expect(collectMarkers(subsublist)).toEqual(['i.']);
  });

  it('restricts the cursor', () => {
    const selection = new TextSelection(atb, at2);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, indentLi);
    expect(modified.selection.anchor).toBe(modified.selection.head);
    // We sunk the b.
    const subsublist = pathToResolvedPos(
      modified.doc,
      ['list', 'listitem', 'list', 'listitem', 'list'],
    ).parent;
    expect(collectMarkers(subsublist)).toEqual(['i.']);
    // But left the 2. the same
    const list = pathToResolvedPos(modified.doc, ['list']).parent;
    expect(collectMarkers(list)).toEqual(['1.', '2.']);
  });

  it('joins existing lists', () => {
    const selection = new TextSelection(at2);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, indentLi);
    const sublist = pathToResolvedPos(
      modified.doc,
      ['list', 'listitem', 'list'],
    ).parent;
    expect(collectMarkers(sublist)).toEqual(['a.', 'b.', 'c.']);
  });
});

describe('outdentLi()', () => {
  const doc = factory.policy([
    factory.para('Intro'),
    factory.list('1.', [
      factory.listitem('1.', [
        factory.para('one'),
        factory.list('a.', [
          factory.listitem('a.', [factory.para('ay')]),
          factory.listitem('b.', [factory.para('be')]),
        ]),
      ]),
      factory.listitem('2.', [factory.list('a.', [
        factory.listitem('a.', [factory.para('2ay')]),
      ])]),
    ]),
  ]);
  const inIntro = pathToResolvedPos(doc, ['para', 'paraText']);
  const at1 = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'paraText']);
  const ata = pathToResolvedPos(
    doc,
    ['list', 'listitem', 'list', 'listitem', 'para', 'paraText'],
  );
  const atb = pathToResolvedPos(
    doc,
    ['list', 'listitem', 'list', new NthType(1, 'listitem'), 'para', 'paraText'],
  );
  const at2 = pathToResolvedPos(doc, ['list', new NthType(1, 'listitem')]);

  it('must be in an li', () => {
    const selection = new TextSelection(inIntro);
    const state = EditorState.create({ doc, selection });
    expect(outdentLi(state)).toBe(false);
    expect(outdentLi(state, jest.fn())).toBe(false);
  });

  it('restricts the cursor', () => {
    const selection = new TextSelection(ata, atb);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, outdentLi);
    expect(modified.selection.anchor).toBe(modified.selection.head);
    // We lifted the a.
    expect(collectMarkers(modified.doc.child(1))).toEqual(['1.', '2.', '3.']);
    // But didn't lift the b.
    const sublist = modified.doc.child(1).child(1).child(1);
    expect(sublist.childCount).toBe(1);
    expect(collectMarkers(sublist)).toEqual(['a.']);
  });

  it('lifts nested lis one level', () => {
    const selection = new TextSelection(atb);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, outdentLi);
    const list = modified.doc.child(1);
    expect(collectMarkers(list)).toEqual(['1.', '2.', '3.']);
    expect(list.child(1).textContent).toBe('be');
    const sublist1 = list.child(0).child(1);
    const sublist2 = list.child(2).child(0);
    expect(collectMarkers(sublist1)).toEqual(['a.']);
    expect(collectMarkers(sublist2)).toEqual(['a.']);
  });

  it('keeps moves children to the new parent', () => {
    const selection = new TextSelection(ata);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, outdentLi);
    const list = modified.doc.child(1);
    expect(collectMarkers(list)).toEqual(['1.', '2.', '3.']);
    expect(list.child(0).textContent).toBe('one');
    const sublist1 = list.child(1).child(1);
    const sublist2 = list.child(2).child(0);
    expect(collectMarkers(sublist1)).toEqual(['a.']);
    expect(collectMarkers(sublist2)).toEqual(['a.']);
  });

  it('lifts top-level lis out', () => {
    const selection = new TextSelection(at1);
    const state = EditorState.create({ doc, selection });
    const modified = executeTransform(state, outdentLi);
    expect(modified.doc.childCount).toBe(3);
    expect(modified.doc.child(0).textContent).toBe('Intro');
    expect(modified.doc.child(1).textContent).toBe('one');
    expect(modified.doc.child(1).type).toBe(schema.nodes.para);

    const list = modified.doc.child(2);
    expect(collectMarkers(list)).toEqual(['1.', '2.', '3.']);
    expect(list.child(0).textContent).toBe('ay');
    expect(list.child(1).textContent).toBe('be');
    const sublist = list.child(2).child(0);
    expect(collectMarkers(sublist)).toEqual(['a.']);
  });
});

describe('makeSave()', () => {
  it('calls the save function', async () => {
    (serializeDoc as jest.Mock).mockImplementationOnce(() => ({ serialized: 'content' }));

    const api = new JsonApi({ csrfToken: '', url: '' });
    const save = makeSave(api);
    await save({ doc: 'stuff' });

    expect(serializeDoc).toBeCalledWith('stuff');
    expect(api.write).toBeCalledWith({ serialized: 'content' });
  });
});

describe('makeSaveThenXml()', () => {
  it('calls the save function', async () => {
    (serializeDoc as jest.Mock).mockImplementationOnce(() => ({ serialized: 'content' }));

    const api = new JsonApi({ csrfToken: '', url: '' });
    const save = makeSaveThenXml(api);
    const doc = factory.policy();
    await save(EditorState.create({ doc }));

    expect(serializeDoc).toBeCalledWith(doc);
    expect(api.write).toBeCalledWith({ serialized: 'content' });
  });

  it('changes the window location', async () => {
    const locationAssign = window.location.assign as jest.Mock;
    locationAssign.mockClear();

    const api = new JsonApi({ csrfToken: '', url: '' });
    const save = makeSaveThenXml(api);
    await save(EditorState.create({ doc: factory.policy() }));

    const param = locationAssign.mock.calls[0][0];
    expect(param).toMatch(/akn$/);
  });
});

describe('addListItem()', () => {
  const doc = factory.policy([
    factory.para('intro'),
    factory.list('a:', [
      factory.listitem('a:', [factory.para('aaa')]),
      factory.listitem('b:', [
        factory.para('bbb first'),
        factory.para('bbb second'),
      ]),
    ]),
  ]);

  function makeState(path: SelectionPath) {
    const selection = new TextSelection(pathToResolvedPos(doc, path));
    return EditorState.create({ doc, selection });
  }

  it('requires the cursor be in the right position', () => {
    const inIntro = makeState(['para', 'paraText', 'int'.length]);
    const endIntro = makeState(['para', 'paraText', 'intro'.length]);
    const middleOfLi = makeState(['list', 'listitem', 'para', 'paraText', 'a'.length]);
    const endOfFirstPara = makeState(
      ['list', new NthType(1, 'listitem'), 'para', 'paraText', 'bbb first'.length]);
    [inIntro, endIntro, middleOfLi, endOfFirstPara].forEach(state =>
      expect(addListItem(state)).toBe(false));
  });

  it('adds a new li', () => {
    const init = makeState(['list', 'listitem', 'para', 'paraText', 'aaa'.length]);
    expect(doc.content.child(1).content.childCount).toBe(2);
    const result = executeTransform(init, addListItem);
    const list = result.doc.content.child(1);
    expect(list.content.childCount).toBe(3);
    expect(list.content.child(1).textContent).toBe(' ');
  });

  it('puts the cursor in the li', () => {
    const init = makeState(['list', 'listitem', 'para', 'paraText', 'aaa'.length]);
    const result = executeTransform(init, addListItem);
    const paraTextPath = ['list', new NthType(1, 'listitem'), 'para', 'paraText'];
    expect(result.selection.anchor).toBe(
      pathToResolvedPos(result.doc, paraTextPath).pos);
    expect(result.selection.head).toBe(
      pathToResolvedPos(result.doc, [...paraTextPath, ' '.length]).pos);
  });
});
