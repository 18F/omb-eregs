import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

import FilterRemoveView from './remove-view';

export function RemoveLinkContainer({ existing, field, heading, idToRemove, name, route, router }) {
  const remaining = existing.filter(id => id !== idToRemove);
  const modifiedQuery = Object.assign({}, router.query, {
    [field]: remaining.join(','),
  });
  delete modifiedQuery.page;

  return <FilterRemoveView heading={heading} name={name} params={modifiedQuery} route={route} />;
}

RemoveLinkContainer.propTypes = {
  existing: PropTypes.arrayOf(PropTypes.number).isRequired,
  field: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  idToRemove: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export default withRouter(RemoveLinkContainer);
