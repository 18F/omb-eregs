import React from 'react';

import FootnoteCitation from '../components/content-renderers/footnote-citation';
import PlainText from '../components/content-renderers/plain-text';

/* Looks up the React Component for each element in the contents field and
 * renders it */
export default function renderContents(contents) {
  const contentMapping = {
    footnote_citation: FootnoteCitation,
  };

  return contents.map((content, idx) => {
    const ContentComponent = contentMapping[content.content_type] || PlainText;
    // We're guaranteed these have a consistent order
    /* eslint-disable react/no-array-index-key */
    return <ContentComponent content={content} key={idx} />;
    /* eslint-enable react/no-array-index-key */
  });
}
