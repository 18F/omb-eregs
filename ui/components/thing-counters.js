import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

function isUnfiltered(query) {
  const noPage = Object.assign({}, query);
  delete noPage.page;
  const values = Object.keys(noPage).map(key => noPage[key]);
  return values.every(x => x === ''); // true if all empty.
}

export function ThingCounter({ count, plural, router, singular }) {
  const { query } = router;
  const noun = count === 1 ? singular : plural;
  const verb = count === 1 ? 'matches' : 'match';
  const classes = count === 0 ? 'alert p1 m1 border' : '';

  const unfiltered = isUnfiltered(query);
  const searchText = unfiltered ? '.' : ` ${verb} your search.`;

  const noMatches = `No ${noun} ${verb} your search, try removing some filters to see more results.`;
  const someMatches = `${count} ${noun}${searchText}`;

  const text = count === 0 ? noMatches : someMatches;
  return (
    <div className={classes}>
      {text}
    </div>
  );
}

ThingCounter.defaultProps = {
  count: 0,
  plural: '',
  singular: '',
};

ThingCounter.propTypes = {
  count: PropTypes.number,
  plural: PropTypes.string,
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
  singular: PropTypes.string,
};

export default withRouter(ThingCounter);
