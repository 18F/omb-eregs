import React from 'react';

export default function ThingCounter({ count, chunk, singular, plural }, { router }) {
  const query = router.location.query;
  const queryKeys = Object.keys(query);
  const noun = count === 1 ? singular : plural;
  const verb = count === 1 ? 'matches' : 'match';

  const unfiltered = queryKeys.length === 0 || (queryKeys.length === 1 && queryKeys.indexOf('page') !== -1);
  const searchText = unfiltered ? '.' : ` ${verb} your search.`;

  const noMatches = `No ${noun} ${verb} your search, try removing some filters to see more results.`;
  const someMatches = `${count} ${noun}${searchText}`;

  const text = count === 0 ? `${noMatches}` : `${someMatches}`;
  return (
    <div>
      {`${text}`}
    </div>
  );
}

ThingCounter.defaultProps = {
  count: 0,
  chunk: 0,
  singular: '',
  plural: '',
};

ThingCounter.propTypes = {
  count: React.PropTypes.number,
  chunk: React.PropTypes.number,
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

