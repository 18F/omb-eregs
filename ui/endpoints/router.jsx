import React from 'react';
import { renderToString } from 'react-dom/server';
import { Resolver } from 'react-resolver';
import { match, RouterContext } from 'react-router';

import routes from '../routes';

export default function (req, res) {
  match({ routes, location: req.url }, (error, redirectCtx, renderProps) => {
    if (error) {
      res.status(500).send(error.message);
    } else if (redirectCtx) {
      res.redirect(302, redirectCtx.pathname + redirectCtx.search);
    } else if (renderProps) {
      Resolver.resolve(() => <RouterContext {...renderProps} />).then(({ Resolved, data }) => {
        res.status(200).send(
          `<html>
            <head><link rel="stylesheet" href="/static/styles.css" /></head>
            <body>
              <div id="app">${renderToString(<Resolved />)}</div>
              <script>window.__REACT_RESOLVER_PAYLOAD__ = ${JSON.stringify(data)}</script>
              <script>window.API_URL = "${process.env.PUBLIC_API}";</script>
              <script src="/static/browser.js"></script>
            </body>
          </html>`);
      });
    } else {
      res.status(404).send('Not found');
    }
  });
}

