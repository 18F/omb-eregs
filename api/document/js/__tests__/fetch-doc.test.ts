import axios from 'axios';

import fetchDoc, { convertNode } from '../fetch-doc';

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

    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(2);
    expect(result.content.map(c => c.type)).toEqual(
      ['unimplemented_node', 'unimplemented_node'])
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
      expect(result.type).toBe('unimplemented_node');
      expect(result.attrs).toEqual({ data: node });
      expect(result.content).toBeUndefined();
    });
  });
});
