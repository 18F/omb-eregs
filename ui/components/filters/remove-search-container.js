import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import FilterRemoveView from './remove-view';

export function RemoveSearchContainer({ field, route, router }) {
  const { query } = router;
  const existing = query[field];
  if (!existing) {
    return null;
  }

  const modifiedQuery = Object.assign({}, query);
  delete modifiedQuery[field];
  delete modifiedQuery.page;
  return <FilterRemoveView heading="Search" name={existing} params={modifiedQuery} route={route} />;
}

RemoveSearchContainer.propTypes = {
  field: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export default withRouter(RemoveSearchContainer);
