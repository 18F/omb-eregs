import { createMarkerTemplate, deeperBullet } from '../list-utils';
import pathToResolvedPos, { NthType } from '../path-to-resolved-pos';
import { factory } from '../schema';

describe('deeperBullet()', () => {
  const doc = factory.policy([
    factory.list([
      factory.listitem('●', [factory.para('First')]),
      factory.listitem('●', [
        factory.para('Second'),
        factory.list([
          factory.listitem('○', [
            factory.list([
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

describe('createMarkerTemplate()', () => {
  it('works with decimals', () => {
    const tpl = createMarkerTemplate('1.');
    expect(tpl(0)).toBe('1.');
    expect(tpl(3)).toBe('4.');
    expect(tpl(25)).toBe('26.');
  });

  it('works with parens', () => {
    const tpl = createMarkerTemplate('(a)');
    expect(tpl(0)).toBe('(a)');
    expect(tpl(8)).toBe('(i)');
    expect(tpl(99)).toBe('(vvvv)');
  });

  it('works when a known character is not present', () => {
    const tpl = createMarkerTemplate('■');
    expect(tpl(0)).toBe('■');
    expect(tpl(7)).toBe('■');
    expect(tpl(9999)).toBe('■');
  });

  it('selects the *last* match', () => {
    const tpl = createMarkerTemplate('4.c.R.i');
    expect(tpl(0)).toBe('4.c.R.i');
    expect(tpl(7)).toBe('4.c.R.viii');
    expect(tpl(100)).toBe('4.c.R.ci');
  });
});
