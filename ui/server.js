/* eslint-disable no-console */
import 'newrelic';  // must be first

import path from 'path';

import cfenv from 'cfenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import basicAuth from './basic-auth';
import doNotCache from './do-not-cache';
import errorHandler from './error-handling';
import serverRender from './server-render';

const app = express();
const env = cfenv.getAppEnv();
const auth = basicAuth(env.getServiceCreds('config'));

/* Middleware */
// security headers. See docs around setOnOldIE: moral of the story is that
// ZAP masquerades as IE6 which triggers a different policy within helmet
app.use(helmet({ xssFilter: { setOnOldIE: true } }));
app.use(doNotCache);
// logging
app.use(morgan('combined'));
app.use('/static', express.static(path.join('ui-dist', 'static')));
if (auth) {
  app.use(auth);
}
app.use(errorHandler);

app.get('*', serverRender);

/* Start */
app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});
