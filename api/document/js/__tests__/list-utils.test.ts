import { EditorState } from 'prosemirror-state';

import { collectMarkers, deeperBullet, renumberList } from '../list-utils';
import pathToResolvedPos, { NthType } from '../path-to-resolved-pos';
import { factory } from '../schema';

describe('deeperBullet()', () => {
  const doc = factory.policy([
    factory.list(' ', [
      factory.listitem('●', [factory.para('First')]),
      factory.listitem('●', [
        factory.para('Second'),
        factory.list(' ', [
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
    const pos = pathToResolvedPos(doc, ['para', 'inline']);
    expect(deeperBullet(pos)).toBe('●');
  });

  it('selects the second level marker', () => {
    const pos = pathToResolvedPos(doc, ['list', 'listitem', 'para', 'inline']);
    expect(deeperBullet(pos)).toBe('○');
  });

  it('selects the third level marker', () => {
    const pos = pathToResolvedPos(
      doc,
      ['list', new NthType(1, 'listitem'), 'list', 'listitem', 'para', 'inline'],
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
      'inline',
    ]);
    expect(deeperBullet(pos)).toBe('●');
  });
});

describe('renumberList()', () => {
  it('uses the first li as a template', () => {
    const doc = factory.policy([
      factory.list('>a<', [
        factory.listitem('>a<', []),
        factory.listitem('(b)', []),
        factory.listitem('4444', []),
      ]),
    ]);
    const initialState = EditorState.create({ doc });
    const pos = pathToResolvedPos(doc, ['list', 'listitem']).pos;
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
    const pos = pathToResolvedPos(doc, ['list', 'listitem']).pos;
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
      ['list', new NthType(1, 'listitem'), 'list', 'listitem'],
    ).pos;
    const resultTr = renumberList(initialState.tr, pos);
    const list = initialState.apply(resultTr).doc.content.child(0);
    const subList = list.content.child(1).content.child(0);

    expect(collectMarkers(list)).toEqual(['a>>', 'x']);
    expect(collectMarkers(subList)).toEqual(['1*', '2*']);
  });
});
