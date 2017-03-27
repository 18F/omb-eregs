/* eslint-disable no-console */
import {} from 'newrelic';  // must be first

import path from 'path';

import cfenv from 'cfenv';
import express from 'express';
import morgan from 'morgan';

import basicAuth from './basic-auth';
import { setApiUrl } from './globals';
import routerEndpoint from './endpoints/router';

const app = express();
const env = cfenv.getAppEnv();
const auth = basicAuth(env.getServiceCreds('config'));

/* Global State */
setApiUrl(process.env.INTERNAL_API);

/* Middleware */
app.use(morgan('combined'));
app.use('/static', express.static(path.join('ui-dist', 'static')));
if (auth) {
  app.use(auth);
}

/* Endpoints */
app.get('*', routerEndpoint);

/* Start */
app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});
