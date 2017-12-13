import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';

import { enterSection, exitSection } from '../store/actions';
import { allIds } from '../store/reducer';

/* We only want to wrap components which are in the table of contents to limit
 * the amount of state changes */
function mapStateToProps({ tableOfContents }, { id }) {
  return {
    trackScroll: allIds(tableOfContents).includes(id),
  };
}

function mapDispatchToProps(dispatch, { id }) {
  return {
    onEnter: () => dispatch(enterSection(id)),
    onLeave: () => dispatch(exitSection(id)),
  };
}

/* Wrap the provided component in a scroll-tracker that'll update in-document
 * navigation. */
export default function withScrollTracking(WrappedComponent) {
  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  function WithScrollTracking({ onEnter, onLeave, trackScroll, ...props }) {
    if (trackScroll) {
      // Wrap with div so Waypoint knows what to track
      return (
        <Waypoint onEnter={onEnter} onLeave={onLeave}>
          <div>
            <WrappedComponent {...props} />
          </div>
        </Waypoint>
      );
    }
    return <WrappedComponent {...props} />;
  }
  WithScrollTracking.propTypes = {
    onEnter: PropTypes.func.isRequired,
    onLeave: PropTypes.func.isRequired,
    trackScroll: PropTypes.bool.isRequired,
  };

  WithScrollTracking.displayName = `withScrollTracking(${wrappedComponentName})`;
  return connect(mapStateToProps, mapDispatchToProps)(WithScrollTracking);
}
