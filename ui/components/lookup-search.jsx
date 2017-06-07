import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';
import validator from 'validator';

import { redirectQuery, redirectWhiteList } from '../redirects';
import { UserError } from '../error-handling';
import { apiNameField, search } from '../lookup-search';
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
    throw new UserError('Needs a "q" parameter');
  } else if (validator.isEmpty(clean.insertParam)) {
    throw new UserError('Needs an "insertParam" parameter');
  } else if (!validator.isIn(clean.redirect.pathname, redirectWhiteList)) {
    throw new UserError('Invalid "redirectPathname" parameter');
  }

  return clean;
}

function Entry({ entry, location, lookup }) {
  const name = entry[apiNameField[lookup]];
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
  lookup: 'topics',
};
Entry.propTypes = {
  entry: React.PropTypes.shape({
    name: React.PropTypes.string,
  }),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({}),
  }),
  lookup: React.PropTypes.oneOf(Object.keys(apiNameField)),
};


export function LookupSearch({ routes, location, pagedEntries }) {
  const lookup = routes[routes.length - 1].path;
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
  routes: [{ path: 'topics' }],
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

/**
 * Asynchronously grab the search result data from the API.
 **/
function fetchData({ routes, location: { query } }) {
  const lookup = routes[routes.length - 1].path;
  const userParams = cleanParams(query);
  return search(lookup, userParams.q, userParams.page);
}

export default resolve('pagedEntries', fetchData)(LookupSearch);
