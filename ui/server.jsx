/* eslint-disable no-console */
import {} from 'newrelic';  // must be first

import path from 'path';

import cfenv from 'cfenv';
import express from 'express';
import morgan from 'morgan';

import basicAuth from './basic-auth';
import serverRender from './server-render';

const app = express();
const env = cfenv.getAppEnv();
const auth = basicAuth(env.getServiceCreds('config'));

/* Middleware */
app.use(morgan('combined'));
app.use('/static', express.static(path.join('ui-dist', 'static')));
if (auth) {
  app.use(auth);
}

app.get('*', serverRender);

/* Start */
app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});
