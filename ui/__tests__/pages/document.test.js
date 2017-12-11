import { shallow } from 'enzyme';
import React from 'react';

import { Document, getInitialProps } from '../../pages/document';
import { loadDocument } from '../../store/actions';
import endpoints from '../../util/api/endpoints';
import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

jest.mock('../../util/render-node');
jest.mock('../../util/api/endpoints');

describe('<Document />', () => {
  it('calls renderNode with a DocumentNode', () => {
    renderNode.mockImplementationOnce(() => <span>Stuff</span>);
    const docNode = { children: [], some: 'thing' };
    const result = shallow(<Document docNode={docNode} />);
    expect(result.text()).toMatch(/Stuff/);
    expect(renderNode).toHaveBeenCalledTimes(1);
    expect(renderNode).toHaveBeenCalledWith(new DocumentNode(docNode));
  });
  it('includes the DocumentNav', () => {
    renderNode.mockImplementationOnce(() => null);
    const result = shallow(<Document docNode={{ identifier: 'abc' }} />);
    const nav = result.find('Connect(DocumentNav)');
    expect(nav).toHaveLength(1);
    expect(nav.prop('isRoot')).toBe(true);
  });
});

describe('getInitialProps()', () => {
  it('passes up 404s', async () => {
    endpoints.document.fetchOne = jest.fn(() => {
      const error404 = new Error('Not Found');
      error404.response = { status: 404 };
      throw error404;
    });

    const result = await getInitialProps({ query: {} });
    expect(result).toEqual({ statusCode: 404 });
  });
  it('triggers a document reset', async () => {
    const tableOfContents = { children: [], identifier: 'idid', title: 'ttt' };
    endpoints.document.fetchOne = jest.fn(() => ({ meta: {
      policy: { issuance: '2001-02-03' },
      table_of_contents: tableOfContents,
    } }));
    const store = { dispatch: jest.fn() };

    await getInitialProps({ query: {}, store });
    expect(store.dispatch).toHaveBeenCalledWith(loadDocument(tableOfContents));
  });
});
