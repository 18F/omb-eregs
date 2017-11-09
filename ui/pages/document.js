import PropTypes from 'prop-types';

import wrapPage from '../components/app-wrapper';
import { documentData } from '../util/api/queries';
import DocumentNode from '../util/document-node';
import renderNode from '../util/render-node';


const headerFooterParams = {
  showSearch: true,
  wrapperClassName: 'document-container',
};

export function Document({ docNode }) {
  return renderNode(new DocumentNode(docNode));
}
Document.propTypes = {
  docNode: PropTypes.shape({}).isRequired,
};

export default wrapPage(Document, documentData, headerFooterParams);
