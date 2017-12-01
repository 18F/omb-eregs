import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import renderContents from '../../util/render-contents';
import renderNode from '../../util/render-node';
import FootnoteCitationInTable from '../content-renderers/footnote-citation-in-table';

export default function Td({ docNode }) {
  const content = renderContents(
    docNode.content,
    { footnote_citation: FootnoteCitationInTable },
  );
  return (
    <td className="basic-td" id={docNode.identifier}>
      { content }
      { docNode.children.map(renderNode) }
    </td>
  );
}
Td.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
