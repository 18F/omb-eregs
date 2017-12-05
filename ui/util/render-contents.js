import React from 'react';

import Cite from '../components/content-renderers/cite';
import ExternalLink from '../components/content-renderers/external-link';
import FootnoteCitation from '../components/content-renderers/footnote-citation';
import PlainText from '../components/content-renderers/plain-text';
import Requirement from '../components/content-renderers/requirement';

/* Looks up the React Component for each element in the contents field and
 * renders it */
export default function renderContents(contents, overrideMapping = null) {
  const contentMapping = {
    external_link: ExternalLink,
    cite: Cite,
    footnote_citation: FootnoteCitation,
    requirement: Requirement,
    ...(overrideMapping || {}),
  };

  return contents.map((content, idx) => {
    const ContentComponent = contentMapping[content.content_type] || PlainText;
    // We're guaranteed these have a consistent order
    /* eslint-disable react/no-array-index-key */
    return <ContentComponent content={content} key={idx} />;
    /* eslint-enable react/no-array-index-key */
  });
}
