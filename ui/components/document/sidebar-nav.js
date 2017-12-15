import PropTypes from 'prop-types';
import React from 'react';

import Sticky from '../startup-sticky';
import DocumentNav from './navigation';

export default function SidebarNav({ className, bottomBoundary }) {
  return (
    <div className={className}>
      <Sticky bottomBoundary={bottomBoundary}>
        <DocumentNav className="document-sidebar-nav" isRoot />
      </Sticky>
    </div>
  );
}
SidebarNav.propTypes = {
  className: PropTypes.string,
  bottomBoundary: Sticky.propTypes.bottomBoundary,
};
SidebarNav.defaultProps = {
  className: '',
  bottomBoundary: 0,
};
