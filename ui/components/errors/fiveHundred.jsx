import React from 'react';

import config from '../../config';


export default function FiveHundred({ err }) {
  const title = 'Server Error';
  let debugInfo = null;
  if (config.debug) {
    debugInfo = (
      <ol>
        {
          // We don't have a stable ID across stack trace lines
          /* eslint-disable react/no-array-index-key */
          err.stack.split('\n').map((line, idx) => <li key={idx}>{line}</li>)
          /* eslint-enable react/no-array-index-key */
        }
      </ol>
    );
  }

  return (
    <html lang="en-US">
      <head>
        <title>{ title }</title>
      </head>
      <body>
        <h1>{ title }</h1>
        <p>We&#39;re sorry! Something&#39;s gone wrong. Please try again later</p>
        { debugInfo }
      </body>
    </html>
  );
}
FiveHundred.defaultProps = {
  err: { stack: '' },
};
FiveHundred.propTypes = {
  err: React.PropTypes.shape({
    stack: React.PropTypes.string,
  }),
};
