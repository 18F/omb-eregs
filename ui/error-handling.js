import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import FiveHundred from './components/errors/fiveHundred';
import FourHundred from './components/errors/fourHundred';

/* Babel does not allow us to extend built-ins like Error */
export class UserError {
  constructor(message) {
    this.message = message;
    this.stack = new Error().stack;
  }
}
UserError.prototype = Object.create(Error.prototype);

// The four-argument function is needed as it indicates "error handler" to
// express
/* eslint-disable no-unused-vars */
export default function (err, req, res, next) {
/* eslint-enable no-unused-vars */
  if (err instanceof UserError) {
    const element = React.createElement(FourHundred, { message: err.message });
    res.status(400).send(renderToStaticMarkup(element));
  } else {
    // We're intentionally to log to console
    /* eslint-disable no-console */
    console.error(err.stack);
    /* eslint-enable no-console */
    const element = React.createElement(FiveHundred, { err });
    res.status(500).send(renderToStaticMarkup(element));
  }
}
