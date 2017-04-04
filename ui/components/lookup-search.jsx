import querystring from 'querystring';

import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';
import validator from 'validator';

import api from '../api';
import Pagers from './pagers';

const redirectQueryPrefix = 'redirectQuery__';

/**
 * We expect a query like
 *  /some/path/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectPathname=/prev/path&redirectQuery__lookup_id__in=1,2,3
 *    &redirectQuery__someOtherParameter=value
 * Return a clean version of that data; if we can't validate, raise an
 * exception.
 **/
export function cleanParams(query) {
  const clean = {
    q: (query.q || '').toString(),
    insertParam: (query.insertParam || '').toString(),
    redirect: {
      pathname: (query.redirectPathname || '').toString(),
      query: {},
    },
    page: (query.page || '1').toString(),
  };
  Object.keys(query).forEach((key) => {
    if (key.startsWith(redirectQueryPrefix)) {
      clean.redirect.query[key.substring(redirectQueryPrefix.length)] = query[key];
    }
  });

  if (validator.isEmpty(clean.q)) {
    throw Error('Needs a "q" parameter');
  } else if (validator.isEmpty(clean.insertParam)) {
    throw Error('Needs an "insertParam" parameter');
  } else if (validator.isEmpty(clean.redirect.pathname)) {
    throw Error('Needs a "redirectPathname" parameter');
  } else if (!clean.redirect.pathname.startsWith('/')) {
    throw Error('Invalid "redirectPathname" parameter');
  }

  return clean;
}

/**
 * Mix in the idToInsert into the original request parameters.
 **/
export function redirectQuery(query, insertParam, idToInsert) {
  const result = Object.assign({}, query);
  const ids = (result[insertParam] || '').split(',').filter(i => i.length > 0);
  delete result.page;

  if (!ids.includes(idToInsert)) {
    ids.push(idToInsert);
  }
  result[insertParam] = ids.join(',');

  return result;
}

function redirectUrl(params, idToInsert) {
  const query = redirectQuery(params.redirect.query, params.insertParam, idToInsert);
  const paramStr = querystring.stringify(query);
  return `${params.redirect.pathname}?${paramStr}`;
}

/* Mapping between a lookup type (e.g. "keywords") and the field in the API we
 * should search against/display */
export const apiParam = {
  keywords: 'name',
  policies: 'title',
};

export function redirectIfMatched({ routes, location: { query } }, redirect, done) {
  if (query.page) {
    /* If the user's already paging through search results, we shouldn't try
     * to find an exact match */
    done();
  } else {
    const lookup = routes[routes.length - 2].path;
    const apiQuery = { [apiParam[lookup]]: query.q };
    api[lookup].fetch(apiQuery)
      .then(({ count, results }) => {
        const params = cleanParams(query);
        if (count > 0) {
          redirect(redirectUrl(params, results[0].id));
        }
        done();
      })
      .catch(done);   // pass any exceptions to `done`
  }
}

function Entry({ entry, location, lookup }) {
  const name = entry[apiParam[lookup]];
  const params = cleanParams(location.query);
  const modifiedQuery = redirectQuery(params.redirect.query, params.insertParam, entry.id);
  return (
    <li>
      <Link to={{ pathname: params.redirect.pathname, query: modifiedQuery }}>
        {name}
      </Link>
    </li>
  );
}
Entry.defaultProps = {
  entry: { name: '' },
  location: { query: {} },
  lookup: 'keywords',
};
Entry.propTypes = {
  entry: React.PropTypes.shape({
    name: React.PropTypes.string,
  }),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({}),
  }),
  lookup: React.PropTypes.oneOf(Object.keys(apiParam)),
};


export function LookupSearch({ routes, location, pagedEntries }) {
  const lookup = routes[routes.length - 2].path;
  const params = cleanParams(location.query);

  return (
    <div>
      <div>
        <Link to={params.redirect}>Return</Link>
      </div>
      <ul>
        { pagedEntries.results.map(entry =>
          <Entry key={entry.id} lookup={lookup} location={location} entry={entry} />) }
      </ul>
      <Pagers location={location} count={pagedEntries.count} />
    </div>
  );
}
LookupSearch.defaultProps = {
  routes: [{ path: 'keywords' }, {}],
  location: { query: {} },
  pagedEntries: { count: 0, entries: [] },
};
LookupSearch.propTypes = {
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    path: React.PropTypes.string,
  })),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({}),
  }),
  pagedEntries: React.PropTypes.shape({
    count: React.PropTypes.number,
    entries: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
    })),
  }),
};

export function search(lookup, q, page = '1') {
  const queryParam = `${apiParam[lookup]}__icontains`;
  const apiQuery = { [queryParam]: q, page };
  return api[lookup].fetch(apiQuery);
}

/**
 * Asynchronously grab the search result data from the API.
 * Assume parameters are already validated (lest redirectIfMatched would have
 * failed)
 **/
function fetchData({ routes, location: { query } }) {
  const lookup = routes[routes.length - 2].path;
  const userParams = cleanParams(query);
  return search(lookup, userParams.q, userParams.page);
}

export default resolve('pagedEntries', fetchData)(LookupSearch);
