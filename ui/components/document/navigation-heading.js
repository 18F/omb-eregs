import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

function linkify(tocNode) {
  return (
    <Link className="document-nav-heading" href={`#${tocNode.identifier}`}>
      <div className="document-nav-container">{ tocNode.title }</div>
    </Link>
  );
}

/* Displays a link with a section's title along with links for its subtitles.
 * We only handle 2 levels of navigation. */
export default function NavigationHeading({ tocNode }) {
  const subsections = tocNode.children.map(tocChild => (
    <li key={tocChild.identifier}>{ linkify(tocChild) }</li>
  ));

  return (
    <li>
      { linkify(tocNode) }
      { subsections.length ?
        <ol className="list-reset sub-sections">{ subsections }</ol> : null }
    </li>
  );
}
NavigationHeading.propTypes = {
  tocNode: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({
      identifier: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })).isRequired,
    identifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};
