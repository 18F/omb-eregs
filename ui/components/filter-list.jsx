/**
 * A container for filters, which can be removed with a click. Currently
 * closely tied to Topics, but can be generalized in the future
 **/
import React from 'react';
import { Link } from 'react-router';

import { apiParam } from './lookup-search';
import SearchAutocomplete from './search-autocomplete';

export function Filter({ existingIds, idToRemove, name, removeParam }, { router }) {
  const remainingIds = existingIds.filter(v => v !== idToRemove);
  const { location: { pathname, query } } = router;
  const modifiedQuery = Object.assign({}, query, {
    [removeParam]: remainingIds.join(','),
  });
  delete modifiedQuery.page;

  return (
    <li className="active-filter rounded clearfix mb1 flex relative">
      <span className="filter-name col col-9 p1 center">{name}</span>
      <Link
        to={{ pathname, query: modifiedQuery }}
        className="remove-filter-link rounded-right col col-3 p1 center flex absolute"
      >
        <span className="close-button center block" />
      </Link>
    </li>
  );
}
Filter.defaultProps = {
  existingIds: [],
  idToRemove: 0,
  name: '',
  removeParam: '',
};
Filter.propTypes = {
  existingIds: React.PropTypes.arrayOf(React.PropTypes.number),
  idToRemove: React.PropTypes.number,
  name: React.PropTypes.string,
  removeParam: React.PropTypes.string,
};
Filter.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({}),
    }),
  }),
};

/* Mapping between a lookup type (e.g. "keywords") and the query field that
 * this would need to modify to add/remove lookup values */
export const searchParam = {
  keywords: 'keywords__id__in',
  policies: 'policy_id__in',
};

export default function FilterList({ existingFilters, lookup }) {
  const filterIds = existingFilters.map(existing => existing.id);
  return (
    <div className="req-filter-ui my2">
      <div className="filter-section-header bold">
        {lookup.charAt(0).toUpperCase() + lookup.substr(1)}
      </div>
      <ol className="list-reset">
        { existingFilters.map(filter =>
          <Filter
            key={filter.id} existingIds={filterIds} idToRemove={filter.id}
            name={filter[apiParam[lookup]]} removeParam={searchParam[lookup]}
          />)}
      </ol>
      <SearchAutocomplete lookup={lookup} insertParam={searchParam[lookup]} />
    </div>
  );
}
FilterList.defaultProps = {
  existingFilters: [],
  lookup: 'keywords',
};
FilterList.propTypes = {
  existingFilters: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
  })),
  lookup: React.PropTypes.oneOf(Object.keys(searchParam)),
};
