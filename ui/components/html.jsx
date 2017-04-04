import React from 'react';

import config from '../config';


export default function Html({ contents, data }) {
  const browserConfig = Object.assign({}, config, {
    // Public API endpoint might not match private version
    apiRoot: process.env.PUBLIC_API,
  });
  const jsStr = `
    window.__REACT_RESOLVER_PAYLOAD__ = ${JSON.stringify(data)};
    window.APP_CONFIG = ${JSON.stringify(browserConfig)};
  `;
  // Avoid escaping the JS
  /* eslint-disable react/no-danger */
  const scriptTag = <script dangerouslySetInnerHTML={{ __html: jsStr }} />;
  /* eslint-enable react/no-danger */
  return (
    <html lang="en-US">
      <head>
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <div id="app">
          { contents }
        </div>
        { scriptTag }
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
