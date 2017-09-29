import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import { Async } from 'react-select';

import FallbackView from './fallback-view';
import ConditionalRender from '../conditional-render';
import { apiNameField, makeOptionLoader, redirectQuery } from '../../lookup-search';
import { Router } from '../../routes';


export function Selector(props) {
  const { insertParam, lookup, route, router } = props;
  const onChange = (entry) => {
    const query = redirectQuery(router.query, insertParam, entry.value);
    Router.pushRoute(route, query);
  };

  return (
    <ConditionalRender>
      <FallbackView
        aria-labelledby={props['aria-labelledby']}
        insertParam={insertParam}
        lookup={lookup}
        route={route}
        query={router.query}
      />
      <Async
        aria-labelledby={props['aria-labelledby']}
        loadOptions={makeOptionLoader(lookup)}
        onChange={onChange}
        tabIndex="0"
      />
    </ConditionalRender>
  );
}
Selector.propTypes = {
  'aria-labelledby': PropTypes.string.isRequired,
  lookup: PropTypes.oneOf(Object.keys(apiNameField)).isRequired,
  insertParam: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export default withRouter(Selector);
