import { Fragment } from 'prosemirror-model';

import { apiFactory, convertNode, convertTexts } from '../save-doc';
import schema from '../schema';


describe('convertNode()', () => {
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

    const result = convertNode(node);
    expect(result).toEqual(apiFactory.node('policy', {
      children: [
        apiFactory.node('sec', {
          children: [
            apiFactory.node('heading', {
              content: [
                apiFactory.content('__text__', { text: 'Some heading' }),
              ],
            }),
            apiFactory.node('para', {
              content: [
                apiFactory.content('__text__', { text: 'First paragraph' }),
              ],
            }),
          ],
        }),
        apiFactory.node('para', {
          content: [
            apiFactory.content('__text__', { text: 'A later paragraph' }),
          ],
        }),
      ],
    }));
  });

  it('converts headings', () => {
    const node = schema.nodes.heading.create(
      { depth: 2 }, // this will be ignored
      schema.text('Stuff stuff'),
    );
    const result = convertNode(node);
    expect(result).toEqual({
      node_type: 'heading',
      children: [],
      content: [{ content_type: '__text__', inlines: [], text: 'Stuff stuff' }],
    });
  });

  it('converts unimplemented nodes', () => {
    const node = schema.nodes.unimplemented_node.create({
      data: { some: 'random', attrs: 'here' },
    });
    const result = convertNode(node);
    expect(result).toEqual({ some: 'random', attrs: 'here' });
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
      apiFactory.content('__text__', { text: 'Some ' }),
      apiFactory.content('one', {
        outer: 'thing',
        inlines: [apiFactory.content('two', {
          inner: 'here',
          inlines: [apiFactory.content('three', {
            most: 'deep',
            inlines: [apiFactory.content('__text__', { text: 'nested' })],
          })],
        })],
      }),
      apiFactory.content('__text__', { text: ' content' }),
    ]);
  });
});
