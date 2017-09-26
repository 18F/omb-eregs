import PropTypes from 'prop-types';
import React from 'react';
import validator from 'validator';

import { UserError } from '../error-handling';
import { redirectQuery } from '../redirects';
import { routes, Link } from '../routes';
import { apiNameField, search } from '../lookup-search';
import { wrapWithAjaxLoader } from '../components/ajax-loading';
import HeaderFooter from '../components/header-footer';
import Pagers from '../components/pagers';

const redirectQueryPrefix = 'redirectQuery__';
const validNames = routes.map(r => r.name).filter(n => n);


/*
 * We expect a query like
 *  /some/path/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectRoute=/prev/path&redirectQuery__lookup_id__in=1,2,3
 *    &redirectQuery__someOtherParameter=value
 * Return a clean version of that data; if we can't validate, raise an
 * exception.
 */
export function cleanParams(query) {
  const clean = {
    q: (query.q || '').toString(),
    insertParam: (query.insertParam || '').toString(),
    lookup: (query.lookup || '').toString(),
    redirect: {
      route: (query.redirectRoute || '').toString(),
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
  } else if (!validator.isIn(clean.redirect.route, validNames)) {
    throw new UserError('Invalid "redirectRoute" parameter');
  } else if (!validator.isIn(clean.lookup, Object.keys(apiNameField))) {
    throw new UserError('Invalid "lookup" parameter');
  }

  return clean;
}
const cleanParamTypes = PropTypes.shape({
  q: PropTypes.string.isRequired,
  insertParam: PropTypes.string.isRequired,
  lookup: PropTypes.oneOf(Object.keys(apiNameField)).isRequired,
  redirect: PropTypes.shape({
    route: PropTypes.string.isRequired,
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
});

function Entry({ entry, userParams }) {
  const name = entry[apiNameField[userParams.lookup]];
  const modifiedQuery = redirectQuery(
    userParams.redirect.query, userParams.insertParam, entry.id);
  return (
    <li>
      <Link route={userParams.redirect.route} params={modifiedQuery}>
        <a>{name}</a>
      </Link>
    </li>
  );
}
Entry.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  userParams: cleanParamTypes.isRequired,
};

export function LookupSearch({ pagedEntries, userParams }) {
  let pager;
  if (pagedEntries.count) {
    pager = <Pagers count={pagedEntries.count} />;
  } else {
    pager = <div>No {userParams.lookup} found.</div>;
  }
  const entries = pagedEntries.results.map(entry =>
    <Entry key={entry.id} entry={entry} userParams={userParams} />);

  return (
    <div className="max-width-4 mx-auto my3">
      <div>
        <Link route={userParams.redirect.route}>
          <a>Return to view requirements</a>
        </Link>
      </div>
      <ul>{ entries }</ul>
      { pager }
    </div>
  );
}
LookupSearch.propTypes = {
  pagedEntries: PropTypes.shape({
    count: PropTypes.number.isRequired,
    results: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
  userParams: cleanParamTypes.isRequired,
};

const LookupSearchWithHeaderFooter = props =>
  <HeaderFooter><LookupSearch {...props} /></HeaderFooter>;

/*
 * Asynchronously grab the search result data from the API.
 */
async function fetchData({ query }) {
  const userParams = cleanParams(query);
  return search(lookup, userParams.q, userParams.page);
}

export default wrapWithAjaxLoader(
  LookupSearchWithHeaderFooter, { pagedEntries: fetchData });

