import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import Pagers from '../components/pagers';
import { apiNameField } from '../lookup-search';
import { redirectQuery } from '../redirects';
import { cleanSearchParamTypes, searchRedirectData } from '../queries';
import { Link } from '../routes';


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
  userParams: cleanSearchParamTypes.isRequired,
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
  userParams: cleanSearchParamTypes.isRequired,
};

export default wrapPage(LookupSearch, searchRedirectData);
