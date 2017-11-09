import PropTypes from 'prop-types';
import wrapPage from '../components/app-wrapper';
import { documentData } from '../util/api/queries';
import renderNode from '../util/render-node';


const headerFooterParams = {
  showSearch: true,
  wrapperClassName: 'document-container',
};

export function Document({ docNode }) {
  return renderNode(docNode);
}
Document.propTypes = {
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})), // recursive
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
    identifier: PropTypes.string.isRequired,
    node_type: PropTypes.string.isRequired,
  }).isRequired,
};

export default wrapPage(Document, documentData, headerFooterParams);
