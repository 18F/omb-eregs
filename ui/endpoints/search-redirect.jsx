/* Allow users to search for a lookup value and add it to a query parameter.
 * If an exact match is found, redirect the user to an appropriate page with
 *  the corresponding lookup added to the query parameters.
 * If no exact match is found, render search results. Each entry is a link to
 *  the appropriate page with the lookup added to the query parameters.
 */
import querystring from 'querystring';

import axios from 'axios';

import { apiUrl } from '../globals';

const apiParam = {
  keywords: 'name',
};

/**
 * We expect a query like
 *  /some/path/:lookup/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectLocation=/prev/path&redirectParam[lookup_id__in]=1,2,3
 *    &redirectParam[someOtherParameter]=value
 **/
function validateParams(req) {
  req.checkParams('lookup', 'Invalid lookup type').notEmpty().isIn(Object.keys(apiParam));
  req.checkQuery('q', 'Needs a q parameter').notEmpty();
  req.checkQuery('insertParam', 'Needs an insertParam parameter').nonEmpty();
  req.checkQuery('redirectLocation', 'Needs a redirectLocation parameter').nonEmpty();
  return {
    lookup: req.params.lookup,
    q: req.query.q,
    insertParam: req.query.insertParam,
    page: req.query.page || '1',
    redirect: {
      location: req.query.redirectLocation,
      params: req.query.redirectParam || {},
    },
  };
}

/**
 * Mix in the idToInsert into the original request parameters. We assume the
 * parameters have been validated per validateParams()
 **/
function redirectParams(params, idToInsert) {
  const result = Object.assign({}, params.redirect.params);
  const ids = (result[params.insertParam] || '').split(',');
  delete result.page;

  if (!ids.includes(idToInsert)) {
    ids.push(idToInsert);
  }
  result[params.insertParam] = ids.join(',');

  return result;
}

function redirectUrl(params, idToInsert) {
  const paramStr = querystring.stringify(redirectParams(params, idToInsert));
  return `${params.redirect.location}?${paramStr}`;
}

export default function (req, res) {
  const params = validateParams(req);
  const apiQuery = { params: { [apiParam[params.lookup]]: params.q } };

  axios.get(`${apiUrl()}${params.lookup}/`, apiQuery).then(({ data }) => {
    if (data.count > 0) {
      res.redirect(redirectUrl(params, data.results[0].id));
    } else {
      res.send('Search');
    }
  });
}
