import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';
import DocumentNode from '../../util/document-node';
import NavigationHeading from './navigation-heading';


export default function DocumentNav({ className, docNode }) {
  const { tableOfContents } = docNode.meta;
  const classes = ['list-reset', 'document-nav'];
  if (className) {
    classes.push(className);
  }
  return (
    <ol className={classes.join(' ')}>
      <li>
        <Link className="document-nav-heading" href={`#${tableOfContents.identifier}`}>
          <div className="document-nav-container">Top</div>
        </Link>
      </li>
      { tableOfContents.children.map(tocNode =>
        <NavigationHeading key={tocNode.identifier} tocNode={tocNode} />) }
    </ol>
  );
}
DocumentNav.propTypes = {
  className: PropTypes.string,
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
DocumentNav.defaultProps = {
  className: '',
};
