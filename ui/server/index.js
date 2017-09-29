/* eslint-disable no-console */
require('newrelic'); // must be first

const path = require('path');

const cfenv = require('cfenv');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const next = require('next');
const passport = require('passport');

const setupAuth = require('./auth').default;
const doNotCache = require('./do-not-cache');
const routes = require('../routes');

const expressApp = express();
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const env = cfenv.getAppEnv();

setupAuth(env.getServiceCreds('config') || {});

/* Middleware */
// security headers. See docs around setOnOldIE: moral of the story is that
// ZAP masquerades as IE6 which triggers a different policy within helmet
expressApp.use(helmet({ xssFilter: { setOnOldIE: true } }));
expressApp.use(doNotCache);
// logging
expressApp.use(morgan('combined'));
expressApp.use(passport.initialize());
expressApp.use('*', passport.authenticate(['ip', 'basic'], { session: false }));

nextApp.prepare().then(() => {
  expressApp.use(routes.getRequestHandler(nextApp));

  /* Start */
  expressApp.listen(env.port, () => {
    console.log(`Listening on ${env.port}`);
  });
});
