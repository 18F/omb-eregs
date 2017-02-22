/* eslint no-console: 'off' */
import path from 'path';

import cfenv from 'cfenv';
import express from 'express';
import morgan from 'morgan';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Resolver } from 'react-resolver';
import { match, RouterContext } from 'react-router';

import routes from './routes';

const app = express();
const env = cfenv.getAppEnv();

app.use(morgan('combined'));
app.use('/static', express.static(path.join('ui-dist', 'static')));

app.get('*', (req, res) => {
  match({ routes, location: req.url }, (error, redirectCtx, renderProps) => {
    if (error) {
      res.status(500).send(error.message);
    } else if (redirectCtx) {
      res.redirect(302, redirectCtx.pathname + redirectCtx.search);
    } else if (renderProps) {
      Resolver.resolve(() => <RouterContext {...renderProps} />).then(({ Resolved, data }) => {
        res.status(200).send(
          `<html>
            <body>
              <div id="app">${renderToString(<Resolved />)}</div>
              <script>window.__REACT_RESOLVER_PAYLOAD__ = ${JSON.stringify(data)}</script>
              <script src="/static/browser.js"></script>
            </body>
          </html>`);
      });
    } else {
      res.status(404).send('Not found');
    }
  });
});
app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});
