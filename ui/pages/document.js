import PropTypes from 'prop-types';
import React from 'react';
import Sticky from 'react-stickynode';

import wrapPage from '../components/app-wrapper';
import DocumentNav from '../components/document/navigation';
import { loadDocument } from '../store/actions';
import { documentData, propagate404 } from '../util/api/queries';
import DocumentNode from '../util/document-node';
import renderNode from '../util/render-node';

const headerFooterParams = {
  showSearch: true,
};

export function Document({ docNode }) {
  const doc = new DocumentNode(docNode);
  return (
    <div className="document-container clearfix max-width-4">
      <div className="col col-3 sm-hide xs-hide">
        <Sticky bottomBoundary=".document-container">
          <DocumentNav />
        </Sticky>
      </div>
      <div className="col col-1 sm-hide xs-hide">&nbsp;</div>
      <div className="col-12 md-col-6 col">
        { renderNode(doc) }
      </div>
    </div>
  );
}
Document.propTypes = {
  docNode: PropTypes.shape({}).isRequired,
};

export async function getInitialProps(props) {
  return propagate404(async () => {
    const { docNode } = await documentData(props);
    props.store.dispatch(loadDocument(docNode.meta.table_of_contents));
    return { docNode };
  });
}

export default wrapPage(Document, getInitialProps, headerFooterParams);
