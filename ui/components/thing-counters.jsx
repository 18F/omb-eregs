import React from 'react';

export default function ThingCounter({ count, chunk, singular, plural }, { router }) {
  const { location: { pathname, query } } = router;
  const pageInt = parseInt(query.page || '1', 10) || 1;
  const noun = count === 1 ? singular : plural;
  const highCount = pageInt * chunk;
  const lowCount = (pageInt * chunk) - (chunk - 1);
  const range = count === 1 ? '1' : `${lowCount}–${highCount}`;
  const verb = count === 1 ? 'matches' : 'match';
  return (
    <div>
      {` ${count} ${chunk} ${pathname} ${pageInt} ${noun} `}
      <br />
      {` ${noun} ${range} of ${count} that ${verb} your search.`}
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

