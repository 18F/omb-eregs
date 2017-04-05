import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Error from './components/error';

// The four-argument function is needed as it indicates "error handler" to
// express
/* eslint-disable no-unused-vars */
export default function (err, req, res, next) {
/* eslint-enable no-unused-vars */
  const error = React.createElement(Error, { err });
  res.status(500).send(renderToStaticMarkup(error));
}
