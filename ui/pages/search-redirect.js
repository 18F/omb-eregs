import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import Link from '../components/link';
import PagersContainer from '../components/pagers';
import { apiNameField } from '../lookup-search';
import { cleanSearchParamTypes, redirectQuery, searchRedirectData } from '../util/api/queries';
import pageTitle from '../util/page-title';

function Entry({ entry, userParams }) {
  const name = entry[apiNameField[userParams.lookup]];
  const modifiedQuery = redirectQuery(userParams.redirect.query, userParams.insertParam, entry.id);
  return (
    <li>
      <Link route={userParams.redirect.route} params={modifiedQuery}>
        {name}
      </Link>
    </li>
  );
}
Entry.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  userParams: cleanSearchParamTypes.isRequired,
};

export function SearchRedirect({ pagedEntries, userParams }) {
  const entries = pagedEntries.results.map(entry => (
    <Entry key={entry.id} entry={entry} userParams={userParams} />
  ));

  return (
    <div className="max-width-4 mx-auto my3">
      { pageTitle('Search Results') }
      <div>
        <Link route={userParams.redirect.route} params={userParams.redirect.query}>
          Return to view requirements
        </Link>
      </div>
      <ul>{entries}</ul>
      {pagedEntries.count ? (
        <PagersContainer count={pagedEntries.count} route="search-redirect" />
      ) : (
        <div>No {userParams.lookup} found.</div>
      )}
    </div>
  );
}
SearchRedirect.propTypes = {
  pagedEntries: PropTypes.shape({
    count: PropTypes.number.isRequired,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  userParams: cleanSearchParamTypes.isRequired,
};

export default wrapPage(SearchRedirect, searchRedirectData);
