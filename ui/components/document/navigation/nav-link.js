import jump from 'jump.js';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Link from '../../link';

function scrollTo(anchor) {
  return (e) => {
    e.preventDefault();
    jump(`#${anchor}`);
  };
}

export function NavLink({ active, children, identifier, title }) {
  const className = `document-nav-heading${active ? ' active' : ''}`;
  return (
    <li>
      <Link className={className} href={`#${identifier}`} onClick={scrollTo(identifier)}>
        <div className="document-nav-container">{ title }</div>
      </Link>
      { children }
    </li>
  );
}
NavLink.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  identifier: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
NavLink.defaultProps = {
  active: false,
  children: null,
};

function mapStateToProps({ currentSection }, { identifier }) {
  return { active: currentSection === identifier };
}

export default connect(mapStateToProps)(NavLink);
