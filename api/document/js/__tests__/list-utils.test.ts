import { EditorState } from 'prosemirror-state';

import {
  collapseAdjacentLists,
  collectMarkers,
  deeperBullet,
  deeperOrderedLi,
  renumberAdjacentList,
  renumberList,
  renumberSublists,
} from '../list-utils';
import pathToResolvedPos, { NthType } from '../path-to-resolved-pos';
import { factory } from '../schema';

describe('deeperBullet()', () => {
  const doc = factory.policy([
    factory.list('●', [
      factory.listitem('●', [factory.para('First')]),
      factory.listitem('●', [
        factory.para('Second'),
        factory.list('○', [
          factory.listitem('○', [
            factory.list('■', [
              factory.listitem('■', [factory.para('Deepest')]),
              factory.listitem('■', [factory.para('Deepest too')]),
            ]),
            factory.para('Second level, under the third'),
          ]),
        ]),
      ]),
    ]),
    factory.para('At the end of the doc'),
  ]);

  it('defaults when not in a list', () => {
    const pos = pathToResolvedPos(doc, ['para', 'paraText']);
    expect(deeperBullet(pos)).toBe('●');
  });

  it('selects the second level marker', () => {
    const pos = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'paraText']);
    expect(deeperBullet(pos)).toBe('○');
  });

  it('selects the third level marker', () => {
    const pos = pathToResolvedPos(
      doc,
      ['list', new NthType(1, 'listitem'), 'list', 'listitem', 'para', 'paraText'],
    );
    expect(deeperBullet(pos)).toBe('■');
  });

  it('restarts after three levels', () => {
    const pos = pathToResolvedPos(doc, [
      'list',
      new NthType(1, 'listitem'),
      'list',
      'listitem',
      'list',
      'listitem',
      'para',
      'paraText',
    ]);
    expect(deeperBullet(pos)).toBe('●');
  });
});

describe('deeperOrderedLi()', () => {
  it('matches the parent marker template', () => {
    const doc = factory.policy([factory.list('_1_', [
      factory.listitem('_1_', [factory.para(' ')]),
    ])]);
    const pos = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'paraText']);
    expect(deeperOrderedLi(pos)).toBe('_a_');
  });

  describe('marker selection', () => {
    const pairsToTest = [
      { parentMarker: '1!', newMarker: 'a!' },
      { parentMarker: '@a', newMarker: '@i' },
      { parentMarker: '#i', newMarker: '#1' },
      { parentMarker: 'A$', newMarker: 'I$' },
      { parentMarker: '%I%', newMarker: '%1%' },
    ];
    pairsToTest.forEach(({ parentMarker, newMarker }) => {
      it(`follows ${parentMarker} with ${newMarker}`, () => {
        const doc = factory.policy([factory.list(parentMarker, [
          factory.listitem(parentMarker, [factory.para(' ')]),
        ])]);
        const pos = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'paraText']);
        expect(deeperOrderedLi(pos)).toBe(newMarker);
      });
    });
  });

  it('defaults when not in a list', () => {
    const doc = factory.policy([factory.para(' ')]);
    const pos = pathToResolvedPos(doc, ['para', 'paraText']);
    expect(deeperOrderedLi(pos)).toBe('1.');
  });

  it('defaults when in a bullet', () => {
    const doc = factory.policy([factory.list('●', [
      factory.listitem('●', [factory.para(' ')]),
    ])]);
    const pos = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'paraText']);
    expect(deeperOrderedLi(pos)).toBe('1.');
  });
});

describe('renumberList()', () => {
  it('uses the list attrs as a template', () => {
    const doc = factory.policy([
      factory.list('>a<', [
        factory.listitem('>a<', []),
        factory.listitem('(b)', []),
        factory.listitem('4444', []),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list']).pos;
    const resultTr = renumberList(initialState.tr, pos);
    const result = initialState.apply(resultTr);
    const list = result.doc.content.child(0);
    const markers: string[] = [];
    list.content.forEach(li => markers.push(li.attrs.marker));
    expect(markers).toEqual(['>a<', '>b<', '>c<']);
  });

  it('keeps sub-content', () => {
    const doc = factory.policy([
      factory.list('>a<', [
        factory.listitem('>a<', [factory.para('stuff')]),
        factory.listitem('(b)', [factory.para('more'), factory.para('stuff')]),
      ]),
    ]);
    expect(doc.content.child(0).content.child(0).content.childCount).toBe(1);
    expect(doc.content.child(0).content.child(1).content.childCount).toBe(2);
    expect(doc.textContent).toBe('stuffmorestuff');

    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list']).pos;
    const resultTr = renumberList(initialState.tr, pos);
    const list = initialState.apply(resultTr).doc.content.child(0);

    expect(list.content.child(0).content.childCount).toBe(1);
    expect(list.content.child(1).content.childCount).toBe(2);
    expect(list.textContent).toBe('stuffmorestuff');
  });

  it('only renumbers the immediate containing elt', () => {
    const doc = factory.policy([
      factory.list('a>>', [
        factory.listitem('a>>', []),
        factory.listitem('x', [factory.list('1*', [
          factory.listitem('1*', []),
          factory.listitem('*b*', []),
        ])]),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(
      doc,
      ['list', new NthType(1, 'listitem'), 'list'],
    ).pos;
    const resultTr = renumberList(initialState.tr, pos);
    const list = initialState.apply(resultTr).doc.content.child(0);
    const subList = list.content.child(1).content.child(0);

    expect(collectMarkers(list)).toEqual(['a>>', 'x']);
    expect(collectMarkers(subList)).toEqual(['1*', '2*']);
  });
});

describe('renumberSublists()', () => {
  it('uses the current list attrs as a template for children', () => {
    const doc = factory.policy([
      factory.list('>1<', [
        factory.listitem('>1<', [
          factory.para('intro text'),
          factory.list('(i)', [
            factory.listitem('(i)', [factory.para('eye')]),
            factory.listitem('(ii)', [factory.para('eye eye')]),
          ]),
        ]),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list']).pos;
    const resultTr = renumberSublists(initialState.tr, pos);
    const result = initialState.apply(resultTr);
    const sublist = pathToResolvedPos(
      result.doc,
      ['list', 'listitem', 'list'],
    ).parent;
    expect(collectMarkers(sublist)).toEqual(['>a<', '>b<']);
    expect(sublist.content.child(0).textContent).toBe('eye');
    expect(sublist.content.child(1).textContent).toBe('eye eye');
  });

  it('works with bullets', () => {
    const doc = factory.policy([
      factory.list('●', [
        factory.listitem('●', [
          factory.list('>', [
            factory.listitem('>', []),
            factory.listitem('>', []),
          ]),
        ]),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list']).pos;
    const resultTr = renumberSublists(initialState.tr, pos);
    const result = initialState.apply(resultTr);
    const sublist = pathToResolvedPos(
      result.doc,
      ['list', 'listitem', 'list'],
    ).parent;
    expect(collectMarkers(sublist)).toEqual(['○', '○']);
  });

  it('is recursive', () => {
    const doc = factory.policy([
      factory.list('1>', [
        factory.listitem('1>', [factory.list('A)', [
          factory.listitem('A)', [factory.list('_I_', [
            factory.listitem('_I_', []),
            factory.listitem('_II_', []),
          ])]),
          factory.listitem('B)', [factory.list('?', [
            factory.listitem('?', []),
            factory.listitem('?', []),
          ])]),
        ])]),
      ]),
    ]);

    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list']).pos;
    const resultTr = renumberSublists(initialState.tr, pos);
    const result = initialState.apply(resultTr);
    const sublist = pathToResolvedPos(
      result.doc,
      ['list', 'listitem', 'list'],
    ).parent;
    const subsublist1 = pathToResolvedPos(
      result.doc,
      ['list', 'listitem', 'list', 'listitem', 'list'],
    ).parent;
    const subsublist2 = pathToResolvedPos(
      result.doc,
      ['list', 'listitem', 'list', new NthType(1, 'listitem'), 'list'],
    ).parent;

    expect(collectMarkers(sublist)).toEqual(['a>', 'b>']);
    expect(collectMarkers(subsublist1)).toEqual(['i>', 'ii>']);
    expect(collectMarkers(subsublist2)).toEqual(['i>', 'ii>']);
  });
});

describe('collapseAdjacentLists()', () => {
  it('does nothing if there are not two following lists', () => {
    const doc = factory.policy([
      factory.para('Some text'),
      factory.para('More text'),
      factory.list('*', [factory.listitem('*', [factory.para('li text')])]),
    ]);
    const initialState = EditorState.create({ doc });
    const inFirstPara = pathToResolvedPos(doc, ['para', 'paraText']);
    const firstTr = collapseAdjacentLists(initialState.tr, inFirstPara.pos);
    expect(initialState.doc).toEqual(firstTr.doc);

    const inSecondPara = pathToResolvedPos(
      doc,
      [new NthType(1, 'para'), 'paraText'],
    );
    const secondTr = collapseAdjacentLists(initialState.tr, inSecondPara.pos);
    expect(initialState.doc).toEqual(secondTr.doc);
  });

  it('combines two adjacent lists, into the first', () => {
    const doc = factory.policy([
      factory.para('Some text'),
      factory.list('*', [
        factory.listitem('*', [factory.para('list1 text1')]),
        factory.listitem('*', [factory.para('list1 text2')]),
      ]),
      factory.list('>', [
        factory.listitem('>', [factory.para('list2 text1')]),
        factory.listitem('>', [factory.para('list2 text2')]),
      ]),
    ]);
    expect(doc.childCount).toBe(3);

    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['para']).pos;
    const resultDoc = collapseAdjacentLists(initialState.tr, pos).doc;
    expect(resultDoc.childCount).toBe(2);
    const list = resultDoc.child(1);
    expect(list.childCount).toBe(4);
    expect(list.attrs.markerPrefix).toBe('*');
    expect(list.child(0).textContent).toBe('list1 text1');
    expect(list.child(1).textContent).toBe('list1 text2');
    expect(list.child(2).textContent).toBe('list2 text1');
    expect(list.child(3).textContent).toBe('list2 text2');
  });

  it('collapses multiple lists', () => {
    const doc = factory.policy([
      factory.para('Some text'),
      factory.list('*', [
        factory.listitem('*'),
      ]),
      factory.list('>', [
        factory.listitem('>'),
        factory.listitem('>'),
      ]),
      factory.list('1.', [
        factory.listitem('1.'),
        factory.listitem('2.'),
        factory.listitem('3.'),
      ]),
      factory.list('o', [
        factory.listitem('o'),
        factory.listitem('o'),
        factory.listitem('o'),
        factory.listitem('o'),
      ]),
    ]);
    expect(doc.childCount).toBe(5);

    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['para']).pos;
    const resultDoc = collapseAdjacentLists(initialState.tr, pos).doc;
    expect(resultDoc.childCount).toBe(2);
    const list = resultDoc.child(1);
    expect(list.childCount).toBe(10);
    expect(list.attrs.markerPrefix).toBe('*');
  });
});

describe('renumberAdjacentList()', () => {
  it('does nothing if there is no adjacent list', () => {
    const doc = factory.policy([
      factory.para('Text'),
      factory.para('Second'),
      factory.list('*', []),
    ]);
    const initialState = EditorState.create({ doc });
    const inFirstPara = pathToResolvedPos(doc, ['para']).pos;
    const result = renumberAdjacentList(initialState.tr, '>', inFirstPara);
    expect(initialState.doc).toEqual(result.doc);
  });

  it('uses the provided template', () => {
    const doc = factory.policy([
      factory.para('Text'),
      factory.list('*', [
        factory.listitem('*', []),
        factory.listitem('*', []),
        factory.listitem('*', []),
      ]),
    ]);
    expect(doc.childCount).toBe(2);
    expect(doc.child(1).childCount).toBe(3);

    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['para']).pos;
    const resultDoc = renumberAdjacentList(initialState.tr, '>', pos).doc;
    expect(resultDoc.childCount).toBe(2);
    const list = resultDoc.child(1);
    expect(list.childCount).toBe(3);
    expect(list.attrs.markerPrefix).toBe('>');
    expect(collectMarkers(list)).toEqual(['>', '>', '>']);
  });

  it('renumbers sublists', () => {
    const doc = factory.policy([
      factory.para('Text'),
      factory.list('*', [
        factory.listitem('*', [factory.list('o', [
          factory.listitem('o', []),
          factory.listitem('oo', []),
          factory.listitem('ooo', []),
        ])]),
        factory.listitem('*', [factory.list('1.', [
          factory.listitem('1.', []),
          factory.listitem('2.', []),
        ])]),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['para']).pos;
    const resultDoc = renumberAdjacentList(initialState.tr, '1.', pos).doc;
    const list = resultDoc.child(1);
    const sublist1 = list.child(0).child(0);
    const sublist2 = list.child(1).child(0);

    expect(collectMarkers(list)).toEqual(['1.', '2.']);
    expect(collectMarkers(sublist1)).toEqual(['a.', 'b.', 'c.']);
    expect(collectMarkers(sublist2)).toEqual(['a.', 'b.']);
  });
});
