import PropTypes from 'prop-types';
import React from 'react';

export default function Pagers({ count }, { router }) {
  let prevPage = null;
  let nextPage = null;
  const { location: { pathname, query } } = router;
  let pageInt = parseInt(query.page || '1', 10) || 1;
  const nextOffset = pageInt * 25;

  if (count === 0) {
    pageInt = 0;
  }

  if (pageInt > 1) {
    const modifiedQuery = Object.assign({}, query, { page: pageInt - 1 });
    prevPage = (
      <Link route={pathname} params={modifiedQuery}>
        <a aria-label="Previous page">&lt;</a>
      </Link>
    );
  }
  if (nextOffset < count) {
    const modifiedQuery = Object.assign({}, query, { page: pageInt + 1 });
    nextPage = (
      <Link route={pathname} params={modifiedQuery}>
        <a aria-label="Next page">&gt;</a>
      </Link>
    );
  }
  return (
    <div>
      { prevPage }
      {` ${pageInt} of ${Math.ceil(count / 25)} `}
      { nextPage }
    </div>
  );
}

Pagers.defaultProps = {
  count: 0,
};

Pagers.propTypes = {
  count: PropTypes.number,
};
Pagers.contextTypes = {
  router: PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
      query: PropTypes.shape({
        page: PropTypes.string,
      }),
    }),
  }),
};
