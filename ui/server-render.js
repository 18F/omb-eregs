/* Primary application entrypoint; uses our react-routes to resolve the
 * requested URL and then renders it */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resolver } from 'react-resolver';
import { match, RouterContext } from 'react-router';

import handleError from './error-handling';
import routes from './routes';
import FourOhFour from './components/errors/fourOhFour';
import Html from './components/html';


function render404(res) {
  const fourOhFour = React.createElement(FourOhFour);
  res.status(404).send(renderToStaticMarkup(fourOhFour));
}

function resolveAndRender(renderProps, res) {
  Resolver
    .resolve(() => React.createElement(RouterContext, renderProps))
    .then(({ Resolved, data }) => {
      const contents = React.createElement(Resolved);
      const html = React.createElement(Html, { contents, data });
      res.status(200).send(renderToStaticMarkup(html));
    })
    .catch((err) => {
      if (err.response && err.response.status === 404) {
        render404(res);
      } else {
        handleError(err, null, res);
      }
    });
}


export default function (req, res) {
  match({ routes, location: req.url }, (error, redirectCtx, renderProps) => {
    if (error) {
      handleError(error, null, res);
    } else if (redirectCtx) {
      res.redirect(302, redirectCtx.pathname + redirectCtx.search);
    } else if (renderProps) {
      resolveAndRender(renderProps, res);
    } else {
      render404(res);
    }
  });
}

