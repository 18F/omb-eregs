import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import NavLink from './nav-link';


export function DocumentNav({ className, isRoot, onClick, tableOfContents }) {
  const { identifier } = tableOfContents;
  const classes = ['list-reset'];
  if (className) {
    classes.push(className);
  }
  if (isRoot) {
    classes.push('document-nav');
  }
  const children = tableOfContents.children.map(tocNode => (
    <NavLink
      identifier={tocNode.identifier}
      key={tocNode.identifier}
      onClick={onClick}
      title={tocNode.title}
    >
      { tocNode.children.length ?
        <DocumentNav className="sub-sections" onClick={onClick} tableOfContents={tocNode} /> :
        null }
    </NavLink>
  ));

  return (
    <ol className={classes.join(' ')}>
      { isRoot ? <NavLink identifier={identifier} onClick={onClick} title="Top" /> : null }
      { children }
    </ol>
  );
}
DocumentNav.propTypes = {
  className: PropTypes.string,
  isRoot: PropTypes.bool,
  onClick: PropTypes.func,
  tableOfContents: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // recursive
    identifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};
DocumentNav.defaultProps = {
  className: '',
  isRoot: false,
  onClick: () => {},
};

function mapStateToProps({ tableOfContents }) {
  return { tableOfContents };
}

export default connect(mapStateToProps)(DocumentNav);

