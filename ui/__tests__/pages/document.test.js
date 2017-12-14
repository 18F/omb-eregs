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
  it('includes the SidebarNav', () => {
    renderNode.mockImplementationOnce(() => null);
    const result = shallow(<Document docNode={{ identifier: 'abc' }} />);
    const nav = result.find('SidebarNav');
    expect(nav).toHaveLength(1);
  });
  it('does not include Footnotes if none are present', () => {
    renderNode.mockImplementationOnce(() => null);
    const result = shallow(<Document docNode={{}} />);
    const footnotes = result.find('Connect(withScrollTracking(Footnotes))');
    expect(footnotes).toHaveLength(0);
  });
  it('includes Footnotes', () => {
    renderNode.mockImplementationOnce(() => null);
    const docNode = { meta: { descendant_footnotes: [
      { identifier: 'footnote_1' }, { identifier: 'footnote_2' },
    ] } };
    const result = shallow(<Document docNode={docNode} />);
    const footnotes = result.find('Connect(withScrollTracking(Footnotes))');
    expect(footnotes).toHaveLength(1);
    expect(footnotes.prop('id')).toBe('document-footnotes');
    expect(footnotes.prop('footnotes').map(f => f.identifier)).toEqual(
      ['footnote_1', 'footnote_2'],
    );
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
  describe('document reset', () => {
    const tableOfContents = { children: [], identifier: 'idid', title: 'ttt' };
    const policy = { issuance: '2001-02-03' };
    const store = { dispatch: jest.fn() };

    it('bases hasFootnotes on the proper fields', async () => {
      endpoints.document.fetchOne = jest.fn(() => ({ meta: {
        descendant_footnotes: [],
        policy,
        table_of_contents: tableOfContents,
      } }));

      await getInitialProps({ query: {}, store });
      expect(store.dispatch).toHaveBeenCalledWith(
        loadDocument(tableOfContents, false));

      endpoints.document.fetchOne = jest.fn(() => ({ meta: {
        descendant_footnotes: [1, 2, 3],
        policy,
        table_of_contents: tableOfContents,
      } }));

      await getInitialProps({ query: {}, store });
      expect(store.dispatch).toHaveBeenCalledWith(
        loadDocument(tableOfContents, true));
    });
  });
});
