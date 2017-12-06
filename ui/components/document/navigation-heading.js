import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

/* Displays a link with a section's title along with links for its subtitles.
 * We only handle 2 levels of navigation. */
export default function NavigationHeading({ tocNode }) {
  const subsections = tocNode.children.map(tocChild => (
    <li key={tocChild.identifier}>
      <Link className="section-heading" href={`#${tocChild.identifier}`}>
        <div className="heading-container">{ tocChild.title }</div>
      </Link>
    </li>
  ));

  return (
    <li>
      <Link className="section-heading" href={`#${tocNode.identifier}`}>
        <div className="heading-container">{ tocNode.title }</div>
      </Link>
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
