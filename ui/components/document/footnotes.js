import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import withScrollTracking from '../../util/with-scroll-tracking';
import Footnote from '../node-renderers/footnote';

export function Footnotes({ id, footnotes }) {
  return (
    <div className="bottom-footnotes" id={id}>
      { footnotes.map(fn => <Footnote key={fn.identifier} docNode={fn} />) }
    </div>
  );
}
Footnotes.propTypes = {
  id: PropTypes.string.isRequired,
  footnotes: PropTypes.arrayOf(PropTypes.instanceOf(DocumentNode)).isRequired,
};

export default withScrollTracking(Footnotes);
