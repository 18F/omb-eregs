/* Primary application entrypoint; uses our react-routes to resolve the
 * requested URL and then renders it */
import PropTypes from 'prop-types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resolver } from 'react-resolver';
import { match, RouterContext } from 'react-router';

import handleError from './error-handling';
import routes from './routes';
import FourOhFour from './components/errors/fourOhFour';
import Html from './components/html';


/* Our views expect access to the react-router object via their context.
 * Unfortunately, when rendering a 404, there is no router object (as there's
 * no matched route). Derive a similar object from the Express request here.
 */
class RouterContext404 extends React.Component {
  getChildContext() {
    return { router: { location: {
      pathname: this.props.req.path,
      query: this.props.req.params,
    } } };
  }

  render() {
    return this.props.component;
  }
}
RouterContext404.childContextTypes = {
  router: PropTypes.object,
};
RouterContext404.propTypes = {
  component: PropTypes.node.isRequired,
  req: PropTypes.shape({
    params: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
};


export function render404(req, res) {
  const component = React.createElement(FourOhFour);
  const withContext = React.createElement(RouterContext404, { component, req });
  res.status(404).send(renderToStaticMarkup(withContext));
}

function resolveAndRender(renderProps, req, res) {
  Resolver
    .resolve(() => React.createElement(RouterContext, renderProps))
    .then(({ Resolved, data }) => {
      const html = React.createElement(
        Html, { data }, [React.createElement(Resolved)]);
      res.status(200).send(renderToStaticMarkup(html));
    })
    .catch((err) => {
      // Route is valid, but our code raised a 404
      if (err.response && err.response.status === 404) {
        render404(req, res);
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
      resolveAndRender(renderProps, req, res);
    } else {
      render404(req, res);
    }
  });
}

