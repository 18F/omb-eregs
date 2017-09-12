import PropTypes from 'prop-types';
import React from 'react';

export default function Spinner({ height }) {
  const borderWidth = Math.ceil(height / 10);
  const indicatorStyle = { height: `${height}px` };
  const spinnerStyle = {
    borderWidth: `${borderWidth}px`,
    height: `${height}px`,
    width: `${height}px`,
  };
  return (
    <div className="loading-indicator p2" style={indicatorStyle}>
      <span className="loading-spinner" style={spinnerStyle} />
    </div>
  );
}
Spinner.propTypes = {
  height: PropTypes.number,
};
Spinner.defaultProps = {
  height: 100,
};
