import { Fragment } from 'prosemirror-model';

import serializeDoc, { apiFactory, convertTexts } from '../serialize-doc';
import schema, { factory } from '../schema';


describe('serializeDoc()', () => {
  it('converts nested nodes', () => {
    const node = factory.policy([
      factory.sec([
        factory.heading('Some heading', 1),
        factory.para('First paragraph'),
      ]),
      factory.para('A later paragraph'),
    ]);

    const result = serializeDoc(node);
    expect(result).toEqual(apiFactory.node('policy', {
      children: [
        apiFactory.node('sec', {
          title: 'Some heading',
          children: [
            apiFactory.node('heading', {
              content: [apiFactory.text('Some heading')],
            }),
            apiFactory.node('para', {
              content: [apiFactory.text('First paragraph')],
            }),
          ],
        }),
        apiFactory.node('para', {
          content: [apiFactory.text('A later paragraph')],
        }),
      ],
    }));
  });

  it('converts headings', () => {
    const node = factory.heading('Stuff stuff', 2); // depth is ignored
    const result = serializeDoc(node);
    expect(result).toEqual({
      node_type: 'heading',
      children: [],
      content: [apiFactory.text('Stuff stuff')],
    });
  });

  it('converts heading text to section title', () => {
    const node = factory.sec([
      factory.heading('Stufff', 1),
    ]);
    const result = serializeDoc(node);
    expect(result.title).toEqual('Stufff');
  });

  it('converts unimplemented nodes', () => {
    const node = factory.unimplementedNode({ some: 'random', attrs: 'here' });
    const result = serializeDoc(node);
    expect(result).toEqual({ some: 'random', attrs: 'here' });
  });

  it('converts list nodes', () => {
    const node = factory.list([
      factory.listitem('a)', [
        factory.para('First p'),
        factory.para('Second p'),
      ]),
      factory.listitem('2.', [factory.para('Content')]),
    ]);

    const result = serializeDoc(node);
    expect(result).toEqual(apiFactory.node('list', {
      children: [
        apiFactory.node('listitem', {
          marker: 'a)',
          type_emblem: 'a',
          children: [
            apiFactory.node('para', { content: [apiFactory.text('First p')] }),
            apiFactory.node('para', { content: [apiFactory.text('Second p')] }),
          ],
        }),
        apiFactory.node('listitem', {
          marker: '2.',
          type_emblem: '2',
          children: [
            apiFactory.node('para', { content: [apiFactory.text('Content')] }),
          ],
        }),
      ],
    }));
  });
});

describe('convertTexts()', () => {
  it('converts simple text', () => {
    const result = convertTexts(Fragment.fromArray([
      schema.text('Some content'),
    ]));
    expect(result).toEqual([{
      content_type: '__text__',
      inlines: [],
      text: 'Some content',
    }]);
  });

  it('converts nested marks', () => {
    const result = convertTexts(Fragment.fromArray([
      schema.text('Some '),
      schema.text('nested', [
        factory.unimplementedMark({ content_type: 'one', outer: 'thing' }),
        factory.unimplementedMark({ content_type: 'two', inner: 'here' }),
        factory.unimplementedMark({ content_type: 'three', most: 'deep' }),
      ]),
      schema.text(' content'),
    ]));

    expect(result).toEqual([
      apiFactory.text('Some '),
      apiFactory.content('one', {
        outer: 'thing',
        inlines: [apiFactory.content('two', {
          inner: 'here',
          inlines: [apiFactory.content('three', {
            most: 'deep',
            inlines: [apiFactory.text('nested')],
          })],
        })],
      }),
      apiFactory.text(' content'),
    ]);
  });
});
