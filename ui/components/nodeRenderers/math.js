import PropTypes from 'prop-types';
import katex from 'katex';


export default function TeXMath({ children, docNode }) {
  return (
    <div id={docNode.identifier}>
      { children }
      <div dangerouslySetInnerHTML={{__html: katex.renderToString(docNode.text)}} />
    </div>
  );

}

TeXMath.propTypes = {
  children: PropTypes.node,
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

TeXMath.defaultProps = {
  children: null,
};

