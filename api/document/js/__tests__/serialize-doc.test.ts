import { Fragment } from 'prosemirror-model';

import serializeDoc, { apiFactory, convertTexts } from '../serialize-doc';
import schema from '../schema';


describe('serializeDoc()', () => {
  it('converts nested nodes', () => {
    const node = schema.nodes.policy.create({}, [
      schema.nodes.sec.create({}, [
        schema.nodes.heading.create({ depth: 1 }, schema.text('Some heading')),
        schema.nodes.para.create(
          {},
          schema.nodes.inline.create({}, schema.text('First paragraph')),
        ),
      ]),
      schema.nodes.para.create(
        {},
        schema.nodes.inline.create({}, schema.text('A later paragraph')),
      ),
    ]);

    const result = serializeDoc(node);
    expect(result).toEqual(apiFactory.node('policy', {
      children: [
        apiFactory.node('sec', {
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
    const node = schema.nodes.heading.create(
      { depth: 2 }, // this will be ignored
      schema.text('Stuff stuff'),
    );
    const result = serializeDoc(node);
    expect(result).toEqual({
      node_type: 'heading',
      children: [],
      content: [apiFactory.text('Stuff stuff')],
    });
  });

  it('converts unimplemented nodes', () => {
    const node = schema.nodes.unimplemented_node.create({
      data: { some: 'random', attrs: 'here' },
    });
    const result = serializeDoc(node);
    expect(result).toEqual({ some: 'random', attrs: 'here' });
  });

  it('converts list nodes', () => {
    const node = schema.nodes.list.create({}, [
      schema.nodes.listitem.create({}, [
        schema.nodes.listitemMarker.create({}, schema.text('a)')),
        schema.nodes.listitemBody.create({}, [
          schema.nodes.para.create(
            {}, schema.nodes.inline.create({}, schema.text('First p'))),
          schema.nodes.para.create(
            {}, schema.nodes.inline.create({}, schema.text('Second p')),
          ),
        ]),
      ]),
      schema.nodes.listitem.create({}, [
        schema.nodes.listitemMarker.create({}, schema.text('2.')),
        schema.nodes.listitemBody.create(
          {},
          schema.nodes.para.create(
            {},
            schema.nodes.inline.create({}, schema.text('Content')),
          ),
        ),
      ]),
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
        schema.marks.unimplemented_mark.create({
          data: { content_type: 'one', outer: 'thing' },
        }),
        schema.marks.unimplemented_mark.create({
          data: { content_type: 'two', inner: 'here' },
        }),
        schema.marks.unimplemented_mark.create({
          data: { content_type: 'three', most: 'deep' },
        }),
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
