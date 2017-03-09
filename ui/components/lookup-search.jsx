import querystring from 'querystring';

import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';
import validator from 'validator';

import { apiUrl } from '../globals';
import Pagers from './pagers';

const redirectQueryPrefix = 'redirectQuery__';

/**
 * We expect a query like
 *  /some/path/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectPathname=/prev/path&redirectQuery[lookup_id__in]=1,2,3
 *    &redirectQuery[someOtherParameter]=value
 * Return a clean version of that data; if we can't validate, raise an
 * exception.
 **/
function cleanParams(query) {
  const clean = {
    q: (query.q || '').toString(),
    insertParam: (query.insertParam || '').toString(),
    redirect: {
      pathname: (query.redirectPathname || '').toString(),
      params: {},
    },
    page: (query.page || '1').toString(),
  };
  Object.keys(query).forEach((key) => {
    if (key.startsWith(redirectQueryPrefix)) {
      clean.redirect.params[key.substring(redirectQueryPrefix.length)] = query[key];
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
 * Mix in the idToInsert into the original request parameters. We assume the
 * parameters have been validated per cleanParams()
 **/
function redirectQuery(params, idToInsert) {
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
  const paramStr = querystring.stringify(redirectQuery(params, idToInsert));
  return `${params.redirect.pathname}?${paramStr}`;
}

const apiParam = {
  keywords: 'name',
};

export function redirectIfMatched({ routes, location: { query } }, redirect, done) {
  const lookup = routes[routes.length - 2].path;
  if (query.page) {
    /* If the user's already paging through search results, we shouldn't try
     * to find an exact match */
    done();
  } else {
    const apiQuery = { params: { [apiParam[lookup]]: query.q } };
    axios.get(`${apiUrl()}${lookup}/`, apiQuery)
      .then(({ data: { count, results } }) => {
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
  const modifiedQuery = redirectQuery(params, entry.id);
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
  location: { query: '' },
  lookup: 'keywords',
};
Entry.propTypes = {
  entry: React.PropTypes.shape({
    name: React.PropTypes.string,
  }),
  location: React.PropTypes.shape({
    query: React.PropTypes.string,
  }),
  lookup: React.PropTypes.oneOf(Object.keys(apiParam)),
};


function LookupSearch({ routes, location, pagedEntries }) {
  const lookup = routes[routes.length - 2].path;
  return (
    <div>
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
  location: {},
  pagedEntries: { count: 0, entries: [] },
};
LookupSearch.propTypes = {
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    path: React.PropTypes.string,
  })),
  location: React.PropTypes.shape({}),
  pagedEntries: React.PropTypes.shape({
    count: React.PropTypes.number,
    entries: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
    })),
  }),
};


/**
 * Asynchronously grab the search result data from the API.
 * Assume parameters are already validated (lest redirectIfMatched would have
 * failed)
 **/
function fetchData({ routes, location: { query } }) {
  const lookup = routes[routes.length - 2].path;
  const queryParam = `${apiParam[lookup]}__icontains`;
  const userParams = cleanParams(query);
  const apiQuery = { params: { [queryParam]: userParams.q, page: userParams.page } };

  return axios.get(`${apiUrl()}${lookup}/`, apiQuery).then(({ data }) => data);
}

export default resolve('pagedEntries', fetchData)(LookupSearch);
