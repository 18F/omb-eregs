import jump from 'jump.js';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Link from '../../link';

export function NavLink({ active, children, identifier, onClick, title }) {
  const compoundOnClick = (e) => {
    onClick(e);
    e.preventDefault();
    jump(`#${identifier}`);
  };
  const className = `document-nav-heading${active ? ' active' : ''}`;
  return (
    <li>
      <Link className={className} href={`#${identifier}`} onClick={compoundOnClick}>
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
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
};
NavLink.defaultProps = {
  active: false,
  children: null,
  onClick: () => {},
};

function mapStateToProps({ currentSection }, { identifier }) {
  return { active: currentSection === identifier };
}

export default connect(mapStateToProps)(NavLink);
