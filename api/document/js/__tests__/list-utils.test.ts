import { deeperBullet } from '../list-utils';
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
