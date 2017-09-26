import querystring from 'querystring';

import PropTypes from 'prop-types';
import React from 'react';
import { Async } from 'react-select';

import FallbackView from './fallback-view';
import ConditionalRender from '../conditional-render';
import { apiNameField, makeOptionLoader } from '../../lookup-search';
import { redirectQuery } from '../../redirects';


export default function Selector(props, { router }) {
  const { insertParam, lookup, pathname } = props;
  const onChange = (entry) => {
    const query = redirectQuery(router.location.query, insertParam, entry.value);
    const paramStr = querystring.stringify(query);
    router.push(`${pathname}?${paramStr}`);
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
    location: PropTypes.shape({
      query: PropTypes.shape({}),
      pathname: PropTypes.string,
    }),
    push: PropTypes.func,
  }),
};
