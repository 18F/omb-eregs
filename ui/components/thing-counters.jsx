import React from 'react';

export default function ThingCounter({ count, chunk, singular, plural }, { router }) {
  const query = router.location.query;
  const queryKeys = Object.keys(query);
  const pageInt = parseInt(query.page || '1', 10) || 1;
  const noun = count === 1 ? singular : plural;
  const highCount = pageInt * chunk;
  const lowCount = (pageInt * chunk) - (chunk - 1);
  const range = count === 1 ? '1' : `${lowCount}–${highCount}`;
  const verb = count === 1 ? 'matches' : 'match';

  const unfiltered = queryKeys.length === 0 || (queryKeys.length === 1 && queryKeys.indexOf('page') !== -1);
  const searchText = unfiltered ? '.' : ` that ${verb} your search.`;

  const noMatches = `${noun}: none${searchText}`;
  const someMatches = `${noun} ${range} of ${count}${searchText}`;

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

