import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import validator from 'validator';

import { redirectQuery, redirectWhiteList } from '../redirects';
import { UserError } from '../error-handling';
import { apiNameField, search } from '../lookup-search';
import { wrapWithAjaxLoader } from '../components/ajax-loading';
import App from '../components/app';
import Pagers from '../components/pagers';

const redirectQueryPrefix = 'redirectQuery__';


/*
 * We expect a query like
 *  /some/path/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectPathname=/prev/path&redirectQuery__lookup_id__in=1,2,3
 *    &redirectQuery__someOtherParameter=value
 * Return a clean version of that data; if we can't validate, raise an
 * exception.
 */
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

  if (validator.isEmpty(clean.insertParam)) {
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
  entry: PropTypes.shape({
    name: PropTypes.string,
  }),
  location: PropTypes.shape({
    query: PropTypes.shape({}),
  }),
  lookup: PropTypes.oneOf(Object.keys(apiNameField)),
};


export function LookupSearch({ routes, location, pagedEntries }) {
  const lookup = routes[routes.length - 1].path;
  const params = cleanParams(location.query);
  let pager;
  if (pagedEntries.count) {
    pager = <Pagers location={location} count={pagedEntries.count} />;
  } else {
    pager = <div>No {lookup} found.</div>;
  }

  return (
    <div className="max-width-4 mx-auto my3">
      <div>
        <Link to={params.redirect}>Return to view requirements</Link>
      </div>
      <ul>
        { pagedEntries.results.map(entry =>
          <Entry key={entry.id} lookup={lookup} location={location} entry={entry} />) }
      </ul>
      { pager }
    </div>
  );
}
LookupSearch.defaultProps = {
  routes: [{ path: 'topics' }],
  location: { query: {} },
  pagedEntries: { count: 0, entries: [] },
};
LookupSearch.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string,
  })),
  location: PropTypes.shape({
    query: PropTypes.shape({}),
  }),
  pagedEntries: PropTypes.shape({
    count: PropTypes.number,
    entries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
    })),
  }),
};

const LookupSearchWithApp = props => <App><LookupSearch {...props} /></App>;

/*
 * Asynchronously grab the search result data from the API.
 */
function fetchData({ routes, location: { query } }) {
  const lookup = routes[routes.length - 1].path;
  const userParams = cleanParams(query);
  return search(lookup, userParams.q, userParams.page);
}

export default wrapWithAjaxLoader(LookupSearchWithApp, { pagedEntries: fetchData });

