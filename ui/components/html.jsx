import newrelic from 'newrelic';
import React from 'react';
import serialize from 'serialize-javascript';

import config from '../config';
import DAP from './dap';

function scriptTag(data) {
  const jsStr = `
    window.__REACT_RESOLVER_PAYLOAD__ = ${serialize(data)};
    window.APP_CONFIG = ${serialize(config)};
  `;
  // Avoid escaping the JS
  /* eslint-disable react/no-danger */
  return <script dangerouslySetInnerHTML={{ __html: jsStr }} />;
  /* eslint-enable react/no-danger */
}

/* New Relic's automatically generated timing header is wrapped in script
 * tags, which doesn't play well with React. Rather than copy-pasting their
 * JS (which we'd need to figure out how to parametrize), strip the tags from
 * the generated text. */
function newRelicTag() {
  const stringWithTags = newrelic.getBrowserTimingHeader();
  if (!stringWithTags) {  /* agent is disabled */
    return null;
  }
  const endOpeningTag = stringWithTags.indexOf('>');
  const startClosingTag = stringWithTags.lastIndexOf('<');
  const jsStr = stringWithTags.substring(endOpeningTag + 1, startClosingTag);
  // Avoid escaping the JS
  /* eslint-disable react/no-danger */
  return <script dangerouslySetInnerHTML={{ __html: jsStr }} />;
  /* eslint-enable react/no-danger */
}

export default function Html({ contents, data }) {
  return (
    <html lang="en-US">
      <head>
        { newRelicTag() }
        <link rel="stylesheet" href="/static/styles.css" />
        <DAP />
      </head>
      <body>
        <div id="app">
          { contents }
        </div>
        <script src="/static/ie.js" />
        { scriptTag(data) }
        <script src="/static/browser.js" />
      </body>
    </html>
  );
}
Html.defaultProps = {
  contents: null,
  data: {},
};
Html.propTypes = {
  contents: React.PropTypes.node,
  data: React.PropTypes.shape({}),
};
