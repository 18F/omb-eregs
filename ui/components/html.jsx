import newrelic from 'newrelic';
import PropTypes from 'prop-types';
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
  if (!stringWithTags) { /* agent is disabled */
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

/* Generates the myriad tags needed to support favicons across a variety of
 * OSes, browsers, and display sizes. */
function faviconTags() {
  const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152];
  const appleIcons = appleSizes.map(number =>
    (
      <link
        rel="apple-touch-icon-precomposed"
        sizes={`${number}x${number}`}
        href={`/static/img/favicon/apple-icon-${number}x${number}.png`}
      />
    ),
  );
  const iconSizes = [16, 32, 96, 128, 196];
  const icons = iconSizes.map(number =>
    (
      <link
        rel="icon"
        type="img/png"
        sizes={`${number}x${number}`}
        href={`/static/img/favicon/favicon-${number}x${number}.png`}
      />
    ),
  );

  const msSizes = [70, 144, 150, 310];
  const msSquares = msSizes.map(number =>
    (
      <meta
        name={`msapplication-square${number}x${number}logo`}
        content={`/static/img/favicon/mstile-${number}x${number}.png`}
      />
    ),
  );

  return ([
    appleIcons,
    icons,
    <meta name="application-name" content="&nbsp;" />,
    <meta name="msapplication-TileColor" content="#FFFFFF" />,
    <meta
      name="msapplication-TileImage"
      content="mstile-144x144.png"
    />,
    msSquares,
    <meta
      name="msapplication-wide310x150logo"
      content="mstile-310x150.png"
    />,
  ]);
}

export default function Html({ allowDynamic, children, data }) {
  return (
    <html lang="en-US">
      <head>
        { newRelicTag() }
        <title>OMB Policy Library (Beta)</title>
        <link rel="stylesheet" href="/static/styles.css" />
        <DAP />
        { faviconTags() }
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app">
          { children }
        </div>
        <script src="/static/ie.js" />
        { scriptTag(data) }
        { allowDynamic ? <script src="/static/browser.js" /> : null }
      </body>
    </html>
  );
}
Html.defaultProps = {
  allowDynamic: true,
  children: null,
  data: {},
};
Html.propTypes = {
  allowDynamic: PropTypes.bool,
  children: PropTypes.node,
  data: PropTypes.shape({}),
};
