import axios from 'axios';

import fetchDoc, { convertContent, convertNode } from '../fetch-doc';

jest.mock('axios');

describe('fetchDoc()', () => {
  it('hits the right url', () => {
    axios.get = jest.fn(() => ({ then: jest.fn() }));
    fetchDoc('/admin/document-editor/M-12-34');
    expect(axios.get).toHaveBeenCalledWith('/document/M-12-34');
  });


  it('raises 404, etc. Eventually we will catch them', () => {
    const error404: any = new Error('Not Found');
    error404.response = { status: 404 };

    axios.get = jest.fn(() => { throw error404; });
    expect(() => fetchDoc('/admin/document-editor/M-12-34')).toThrow(error404);
  });
});

describe('convertNode()', () => {
  it('handles the root', () => {
    const node = {
      node_type: 'policy',
      children: [
        { node_type: 'aaaaa', children: [] },
        { node_type: 'bbbbb', children: [] },
      ],
    };

    const result = convertNode(node);

    expect(result.type.name).toBe('doc');
    expect(result.content.childCount).toBe(2);
    expect(result.content.child(0).type.name).toBe('unimplemented_node');
    expect(result.content.child(1).type.name).toBe('unimplemented_node');
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

    const result = convertNode(node);
    expect(result.type.name).toBe('para');
    expect(result.content.childCount).toBe(2);
    expect(result.content.child(0).type.name).toBe('inline');
    expect(result.content.child(0).content.childCount).toBe(2);
    expect(result.content.child(0).content.child(0).text).toBe('Some text ');
    expect(result.content.child(0).content.child(1).text).toBe('here');
    expect(result.content.child(1).type.name).toBe('unimplemented_node');
  });

  it('figures out heading depth', () => {
    const node = {
      children: [{ node_type: 'ignored-child' }],
      identifier: 'policy_1__sec_1__thing_c__sec_4__heading_1',
      node_type: 'heading',
      text: 'Some heading',
    };

    const result = convertNode(node);
    expect(result.type.name).toBe('heading');
    expect(result.attrs.depth).toBe(3);
    expect(result.content.childCount).toBe(1);
    expect(result.content.child(0).text).toBe('Some heading');
  });

  describe('unimplemented_node', () => {
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

      const result = convertNode(node);
      expect(result.type.name).toBe('unimplemented_node');
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
    expect(text1.marks[0].type.name).toBe('unimplemented_mark');
    expect(text1.marks[0].attrs.data.outer).toBe('props');

    expect(text2.type.name).toBe('text');
    expect(text2.marks).toHaveLength(2);
    expect(text2.marks[0].type.name).toBe('unimplemented_mark');
    expect(text2.marks[0].attrs.data.outer).toBe('props');
    expect(text2.marks[1].type.name).toBe('unimplemented_mark');
    expect(text2.marks[1].attrs.data.inner).toBe('stuff');
  });
});
