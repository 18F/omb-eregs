import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import DocumentNav from '../components/document/navigation';
import { resetDocumentState } from '../store/actions';
import { documentData } from '../util/api/queries';
import DocumentNode from '../util/document-node';
import renderNode from '../util/render-node';


const headerFooterParams = {
  showSearch: true,
};

export function Document({ docNode }) {
  const doc = new DocumentNode(docNode);
  return (
    <div className="document-container clearfix max-width-4">
      <DocumentNav className="col col-3 sm-hide xs-hide" docNode={doc} />
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

function getInitialProps(props) {
  props.store.dispatch(resetDocumentState());
  return documentData(props);
}

export default wrapPage(Document, getInitialProps, headerFooterParams);
