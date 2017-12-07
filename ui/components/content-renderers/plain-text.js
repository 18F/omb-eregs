import PropTypes from 'prop-types';


export default function PlainText({ content }) {
  return content.text;
}
PlainText.propTypes = {
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};
