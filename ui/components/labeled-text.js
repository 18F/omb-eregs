import PropTypes from 'prop-types';
import React from 'react';

export default function LabeledText({ children, id, label }) {
  return (
    <div>
      <label className="bold pr1" htmlFor={id}>{ label }</label>
      <span id={id}>{ children }</span>
    </div>
  );
}
LabeledText.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
