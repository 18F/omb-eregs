import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../../util/document-node';
import renderNode from '../../../util/render-node';
import Tfoot from './tfoot';

export default function Table({ docNode }) {
  return (
    <table className="basic-table" id={docNode.identifier}>
      { docNode.children.map(renderNode) }
      <Tfoot docNode={docNode} />
    </table>
  );
}
Table.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
