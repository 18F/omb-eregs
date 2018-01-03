import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import FloatingNav from '../components/document/floating-nav';
import Footnotes from '../components/document/footnotes';
import SidebarNav from '../components/document/sidebar-nav';
import { loadDocument } from '../store/actions';
import { documentData, propagate404 } from '../util/api/queries';
import DocumentNode from '../util/document-node';
import pageTitle from '../util/page-title';
import renderNode from '../util/render-node';

const headerFooterParams = {
  showSearch: true,
};

export function Document({ docNode }) {
  const doc = new DocumentNode(docNode);
  const footnotes = doc.meta.descendantFootnotes;
  return (
    <React.Fragment>
      { pageTitle(doc.meta.policy.titleWithNumber) }
      <FloatingNav />
      <div className="document-container clearfix max-width-4">
        <SidebarNav bottomBoundary=".document-container" className="col col-3 mobile-hide" />
        <div className="col col-1 mobile-hide">&nbsp;</div>
        <div className="col-12 md-col-6 col">
          { renderNode(doc) }
          { footnotes.length ?
            <Footnotes footnotes={footnotes} id="document-footnotes" /> : null }
        </div>
      </div>
    </React.Fragment>
  );
}
Document.propTypes = {
  docNode: PropTypes.shape({}).isRequired,
};

export async function getInitialProps(props) {
  return propagate404(async () => {
    const { docNode } = await documentData(props);
    const tableOfContents = docNode.meta.table_of_contents;
    const hasFootnotes = docNode.meta.descendant_footnotes.length > 0;
    props.store.dispatch(loadDocument(tableOfContents, hasFootnotes));
    return { docNode };
  });
}

export default wrapPage(Document, getInitialProps, headerFooterParams);
