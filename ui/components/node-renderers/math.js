import PropTypes from 'prop-types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import katex from 'katex';

export function texFromContents(contents, inTable = false) {
  const texts = contents.map((content) => {
    switch (content.content_type) {
      case 'footnote_citation': {
        // TeX requires all underscores be escaped
        let url = content.footnote_node.identifier.replace(/_/g, '\\_');
        if (inTable) {
          url = `${url}-table`;
        }
        // We use a markdown syntax to represent this link
        const markdown = `[${content.text}](\\#${url})`;
        // superscript, italic
        return `^{\\textit{${markdown}}}`;
      }

      default: {
        return content.text;
      }
    }
  });
  return texts.join('');
}

/* Until KaTeX#923 is merged, KaTeX doesn't have a mechanism to generate
 * links. We'll hack around it by writing our link in markdown syntax and
 * replacing it in the generated HTML.
 */
export function renderKaTeX(contents, inTable = false) {
  const asHtml = katex.renderToString(
    texFromContents(contents, inTable), { displayMode: true });
  return asHtml.replace(
    // The rather nasty markdown-url regex
    /\[([^\]]*)\]\(([^\\)]*)\)/g,
    // Use React for html escaping
    (_, linkText, linkUrl) => renderToStaticMarkup(<a href={linkUrl}>{ linkText }</a>),
  );
}


export default function TeXMath({ docNode }) {
  const math = renderKaTeX(docNode.content, docNode.hasAncestor('table'));
  /* eslint-disable react/no-danger */
  return (
    <div id={docNode.identifier}>
      <div dangerouslySetInnerHTML={{ __html: math }} />
    </div>
  );
  /* eslint-enable react/no-danger */
}

TeXMath.propTypes = {
  docNode: PropTypes.shape({
    contents: PropTypes.arrayOf(PropTypes.shape({
      content_type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};

TeXMath.defaultProps = {
  children: null,
};
