import React from 'react';

function isUnfiltered(query) {
  const noPage = Object.assign({}, query);
  delete noPage.page;
  return Object.values(noPage).every(x => x === ''); // true if all empty.
}

export default function ThingCounter({ count, singular, plural }, { router }) {
  const query = router.location.query;
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
  singular: '',
  plural: '',
};

ThingCounter.propTypes = {
  count: React.PropTypes.number,
  singular: React.PropTypes.string,
  plural: React.PropTypes.string,
};
ThingCounter.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({
        page: React.PropTypes.string,
      }),
    }),
  }),
};

