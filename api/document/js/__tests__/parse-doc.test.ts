import axios from 'axios';

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
    expect(result.content.child(0).type.name).toBe('inline');
    expect(result.content.child(0).content.childCount).toBe(2);
    expect(result.content.child(0).content.child(0).text).toBe('Some text ');
    expect(result.content.child(0).content.child(1).text).toBe('here');
    expect(result.content.child(1).type).toBe(schema.nodes.unimplementedNode);
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
    const inn = {
      content_type: 'para',
      outer: 'props',
      inlines: [
        { content_type: '__text__', text: 'Initial ' },
        {
          content_type: 'external_link',
          href: 'http://example.org',
          inner: 'stuff',
          inlines: [{ content_type: '__text__', text: 'content.' }],
        },
      ],
    };
    const node = {
      node_type: 'para',
      content: [inn],
      children: [],
    };

    const result = parseDoc(node);
    //console.log(result);
    //console.log(result.content);
    //console.log(result.content.content[0].content.content[0].marks);
    //console.log(result.content.content[0].content.content[1].marks);
    //console.log(result.content.content[0].content);
    //console.log(result);
    expect(result.type.name).toBe('para');
    console.log(result.content.size);
    //console.log(result.content.toString());
    //console.log(result.content.content[0].nodeSize);
    //console.log(result.content.content[0]);
    const testnode = {
      node_type: 'para',
      content: [{
        content_type: 'whatever',
        text: 'foo',
        //children: [],
        inlines: [
          { content_type: 'external_link', href: 'http://example.org/', text: 'WTF' },
        ]

      }]
    };

    const testresult = parseDoc(testnode);
    console.log(testresult.content);
    console.log(testresult.content.toString());
    console.log(testresult.content.content[0].content.toString());

    /*
    console.log(result.content.content);
    result.content.forEach((item) => {
      //console.log(item.content);
    });
    //console.log(result.content);
    */
    const inner = {
      content_type: 'doesnt-exist',
      outer: 'props',
      inlines: [
        { content_type: '__text__', text: 'Initial ' },
        {
          content_type: 'external_link',
          href: 'http://example.org',
          inner: 'stuff',
          inlines: [{ content_type: '__text__', text: 'content.' }],
        },
      ],
    };
    //const res = convertContent(whatev, []);
    //console.log(res[0]);
    //console.log(res[0].marks[0]);
    //console.log(res[1].marks[0]);
    //console.log(res[1].marks[1]);



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
    const result = convertContent(content, []);
    expect(result).toHaveLength(1);
    expect(result[0].type.name).toBe('text');
    expect(result[0].text).toBe('Stuff here!');
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
    const result = convertContent(content, []);
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
