import PropTypes from 'prop-types';
import React from 'react';


export default function PlainText({ content }) {
  return <span>{ content.text }</span>;
}
PlainText.propTypes = {
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};
