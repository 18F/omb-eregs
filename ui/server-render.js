/* Primary application entrypoint; uses our react-routes to resolve the
 * requested URL and then renders it */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resolver } from 'react-resolver';
import { match, RouterContext } from 'react-router';

import routes from './routes';
import Html from './components/html';


export default function (req, res) {
  match({ routes, location: req.url }, (error, redirectCtx, renderProps) => {
    if (error) {
      res.status(500).send(error.message);
    } else if (redirectCtx) {
      res.redirect(302, redirectCtx.pathname + redirectCtx.search);
    } else if (renderProps) {
      Resolver
        .resolve(() => React.createElement(RouterContext, renderProps))
        .then(({ Resolved, data }) => {
          const contents = React.createElement(Resolved);
          const html = React.createElement(Html, { contents, data });
          res.status(200).send(renderToStaticMarkup(html));
        });
    } else {
      res.status(404).send('Not found');
    }
  });
}

