import axios from 'axios';

import { ApiContent, ApiNode } from '../Api';
import parseDoc, { convertContent } from '../parse-doc';
import { apiFactory } from '../serialize-doc';
import schema from '../schema';

jest.mock('axios');

describe('parseDoc()', () => {
  it('handles the root', () => {
    const node = {
      node_type: 'policy',
      children: [
        { node_type: 'aaaaa', children: [] },
        { node_type: 'bbbbb', children: [] },
      ],
    };

    const result = parseDoc(node);

    expect(result.type.name).toBe('policy');
    expect(result.content.childCount).toBe(2);
    expect(result.content.child(0).type).toBe(schema.nodes.unimplementedNode);
    expect(result.content.child(1).type).toBe(schema.nodes.unimplementedNode);
  });

  it('loads paragraph text', () => {
    const node = {
      node_type: 'para',
      content: [
        { content_type: '__text__', text: 'Some text ' },
        {
          content_type: 'unknown-content',
          inlines: [{ content_type: '__text__', text: 'here' }],
        },
      ],
      children: [{ node_type: 'unknown-child' }],
    };

    const result = parseDoc(node);
    expect(result.type.name).toBe('para');
    expect(result.content.childCount).toBe(2);
    expect(result.content.child(0).type.name).toBe('paraText');
    expect(result.content.child(0).content.childCount).toBe(2);
    expect(result.content.child(0).content.child(0).text).toBe('Some text ');
    expect(result.content.child(0).content.child(1).text).toBe('here');
    expect(result.content.child(1).type).toBe(schema.nodes.unimplementedNode);
  });

  it('does not ignore footnote nodes in policy nodes', () => {
    const node = {
      node_type: 'policy',
      content: [],
      children: [{ node_type: 'footnote' }],
    };

    const result = parseDoc(node);
    expect(result.childCount).toBe(1);
  });

  it('ignores all footnote nodes not in policy nodes', () => {
    const node = {
      node_type: 'sec',
      content: [],
      children: [{ node_type: 'footnote' }],
    };

    const result = parseDoc(node);
    expect(result.childCount).toBe(0);
  });

  it('figures out heading depth', () => {
    const node = {
      children: [{ node_type: 'ignored-child' }],
      identifier: 'policy_1__sec_1__thing_c__sec_4__heading_1',
      node_type: 'heading',
      text: 'Some heading',
    };

    const result = parseDoc(node);
    expect(result.type.name).toBe('heading');
    expect(result.attrs.depth).toBe(3);
    expect(result.content.childCount).toBe(1);
    expect(result.content.child(0).text).toBe('Some heading');
  });

  it('loads lists', () => {
    const node = apiFactory.node('list', { children: [
      apiFactory.node('listitem', {
        marker: 'aaa',
        children: [
          apiFactory.node('para', { content: [apiFactory.text('p1-of-a')] }),
        ],
      }),
      apiFactory.node('listitem', {
        marker: 'bbb',
        children: [
          apiFactory.node('para', { content: [apiFactory.text('p1-of-b')] }),
          apiFactory.node('para', { content: [apiFactory.text('p1-of-b')] }),
        ],
      }),
    ] });

    const result = parseDoc(node);
    expect(result.type.name).toBe('list');
    expect(result.content.childCount).toBe(2);
    const lis = [result.content.child(0), result.content.child(1)];
    expect(lis.map(li => li.type.name)).toEqual(['listitem', 'listitem']);
    expect(lis.map(li => li.attrs.marker)).toEqual(['aaa', 'bbb']);

    expect(lis[0].content.childCount).toBe(1);
    expect(lis[0].content.child(0).type.name).toBe('para');

    expect(lis[1].content.childCount).toBe(2);
    expect(lis[1].content.child(0).type.name).toBe('para');
    expect(lis[1].content.child(1).type.name).toBe('para');
  });

  it('loads links', () => {
    const node: ApiNode = {
      node_type: 'para',
      content: [
        {
          content_type: '__text__',
          text: 'Initial ',
          inlines: [],
        },
        {
          content_type: 'external_link',
          href: 'http://example.org',
          text: 'content.',
          inlines: [{ content_type: '__text__', text: 'content.', inlines: [] }],
        },

      ],
      children: [],
    };

    const result = parseDoc(node); // The top-level node.
    expect(result.type.name).toBe('para'); 
    expect(result.content.size).toEqual('Initial content.'.length + 2); // Node boundaries add two.
    expect(result.childCount).toEqual(1); // One inner node.

    const paraText = result.child(0); // The inner paraText node.
    expect(paraText.content.size).toEqual('Initial content.'.length);
    expect(paraText.type.name).toEqual('paraText');
    expect(paraText.childCount).toEqual(2); // The two inline children of the inner node.

    const plainText = paraText.child(0); // The first inline child, plain text.
    expect(plainText.type.name).toEqual('text');
    expect(plainText.text).toEqual('Initial ');

    const externalLink = paraText.child(1); // The second inline child, containing the link.
    expect(externalLink.type.name).toEqual('text');
    expect(externalLink.text).toEqual('content.');
    expect(externalLink.marks.length).toEqual(1); // Just one link.

    const mark = externalLink.marks[0]; // The link markup.
    expect(mark.type.name).toEqual('external_link');
    expect(mark.attrs.href).toEqual('http://example.org');

  });

  describe('unimplementedNode', () => {
    it('saves original data', () => {
      const node = {
        node_type: 'something-unknown',
        some: 'attr',
        children: [
          { node_type: 'nested', children: [] },
          { node_type: 'nested', children: [] },
          { node_type: 'nested', children: [] },
        ],
      };

      const result = parseDoc(node);
      expect(result.type).toBe(schema.nodes.unimplementedNode);
      expect(result.attrs).toEqual({ data: node });
      expect(result.content.childCount).toBe(0);
    });
  });
});

describe('convertContent()', () => {
  it('bottoms out at a list of texts', () => {
    const content = { content_type: '__text__', text: 'Stuff here!' };
    const result = convertContent(content as ApiContent, []);
    expect(result).toHaveLength(1);
    expect(result[0].type.name).toBe('text');
    expect(result[0].text).toBe('Stuff here!');
  });

  it('loads footnote citations', () => {
    const content = apiFactory.content('footnote_citation', {
      footnote_node: {
        type_emblem: '5',
        content: [
          { content_type: '__text__', text: 'Some text ' },
        ],
      },
    });

    const result = convertContent(content, []);
    expect(result).toHaveLength(1);
    expect(result[0].type.name).toBe('inlineFootnote');
    expect(result[0].attrs.emblem).toBe('5');
    expect(result[0].content.toJSON()).toEqual([{
      text: 'Some text ',
      type: 'text',
    }]);
  });

  it('deals with hierarchy', () => {
    const content = {
      content_type: 'doesnt-exist',
      outer: 'props',
      inlines: [
        { content_type: '__text__', text: 'Initial ' },
        {
          content_type: 'inner-thing',
          inner: 'stuff',
          inlines: [{ content_type: '__text__', text: 'content.' }],
        },
      ],
    };
    const result = convertContent(content as any as ApiContent, []);
    expect(result).toHaveLength(2);
    const [text1, text2] = result;

    expect(text1.type.name).toBe('text');
    expect(text1.marks).toHaveLength(1);
    expect(text1.marks[0].type).toBe(schema.marks.unimplementedMark);
    expect(text1.marks[0].attrs.data.outer).toBe('props');

    expect(text2.type.name).toBe('text');
    expect(text2.marks).toHaveLength(2);
    expect(text2.marks[0].type).toBe(schema.marks.unimplementedMark);
    expect(text2.marks[0].attrs.data.outer).toBe('props');
    expect(text2.marks[1].type).toBe(schema.marks.unimplementedMark);
    expect(text2.marks[1].attrs.data.inner).toBe('stuff');
  });
});
