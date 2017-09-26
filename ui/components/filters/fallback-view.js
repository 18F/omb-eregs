import PropTypes from 'prop-types';
import React from 'react';

export default function FallbackView(props) {
  const { insertParam, lookup, query, route } = props;
  return (
    <form action={`/search-redirect/${lookup}/`} method="GET">
      <input type="hidden" name="insertParam" value={insertParam} />
      <input type="hidden" name="redirectRoute" value={route} />
      <div className="flex clearfix relative">
        <input
          aria-labelledby={props['aria-labelledby']}
          type="text"
          name="q"
          className="filter-lookup-field rounded-left p1 border col col-9"
        />
        { Object.keys(query).map(key =>
          <input key={key} type="hidden" name={`redirectQuery__${key}`} value={query[key]} />)}
        <button
          type="submit"
          className="add-filter-button homepage-filter-button border rounded-right p1 col col-3"
        >
          <img alt="Add" src="/static/img/add-icon.svg" />
        </button>
      </div>
    </form>
  );
}
FallbackView.propTypes = {
  'aria-labelledby': PropTypes.string.isRequired,
  insertParam: PropTypes.string,
  lookup: PropTypes.string.isRequired,
  query: PropTypes.shape({}),
  route: PropTypes.string.isRequired,
};
FallbackView.defaultProps = {
  insertParam: '',
  query: {},
};
