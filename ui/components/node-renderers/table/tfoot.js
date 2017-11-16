import PropTypes from 'prop-types';
import React from 'react';

import renderContents from '../../../util/render-contents';

/* We're assuming, for the time being, that all rows within a single table
 * have the same number of columns. */
function deriveColspan(docNode) {
  const thead = docNode.firstWithNodeType('thead');
  const tr = thead ? thead.firstWithNodeType('tr') : null;
  return tr ? tr.children.length : 1;
}

export default function Tfoot({ docNode }) {
  const footnotes = docNode.meta.descendant_footnotes.map(ft => (
    <div className="node-footnote clearfix" key={ft.identifier} id={`${ft.identifier}-table`}>
      <span className="node-footnote-content">
        <span className="citation-marker">{ft.marker}</span>
        <span className="footnote-text">{ renderContents(ft.content) }</span>
      </span>
    </div>
  ));
  if (footnotes.length === 0) {
    return null;
  }
  return (
    <tfoot className="table-footer">
      <tr>
        <td className="bottom-footnotes table-footer" colSpan={deriveColspan(docNode)}>
          <h1 className="h4">Footnotes for table</h1>
          <div className="table-bottom-footnotes">
            { footnotes }
          </div>
        </td>
      </tr>
    </tfoot>
  );
}
Tfoot.propTypes = {
  docNode: PropTypes.shape({
    meta: PropTypes.shape({
      descendant_footnotes: PropTypes.arrayOf(PropTypes.shape({
        content: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        identifier: PropTypes.string.isRequired,
        marker: PropTypes.string.isRequired,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};
