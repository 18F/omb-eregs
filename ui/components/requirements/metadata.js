import PropTypes from 'prop-types';
import React from 'react';

export default function Metadata({ className, name, value, nullValue, separator }) {
  /**
   * Returns a div element that has className equal to the argument plus 'metadata', and content
   * that is either <name><separator><value> or, if value is null and nullValue is not, the content
   * is the nullValue argument.
   *
   * If value and nullValue are both null, returns null.
   */
  if (!value && !nullValue) {
    return null;
  }
  const classes = className.split(' ');
  const classString = classes.includes('metadata') ? className : `${classes.join(' ')} metadata`;
  const content = value ? `${name}${separator}${value}` : nullValue;
  return <div className={classString}>{`${content}`}</div>;
}

Metadata.propTypes = {
  className: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  nullValue: PropTypes.string,
  separator: PropTypes.string,
};

Metadata.defaultProps = {
  value: '',
  nullValue: '',
  separator: ': ',
};
