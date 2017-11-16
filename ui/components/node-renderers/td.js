import PropTypes from 'prop-types';
import React from 'react';

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
  docNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    content: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};
