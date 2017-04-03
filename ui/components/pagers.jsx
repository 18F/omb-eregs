import React from 'react';
import { Link } from 'react-router';

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
    prevPage = <Link to={{ pathname, query: modifiedQuery }}>&lt;</Link>;
  }
  if (nextOffset < count) {
    const modifiedQuery = Object.assign({}, query, { page: pageInt + 1 });
    nextPage = <Link to={{ pathname, query: modifiedQuery }}>&gt;</Link>;
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
  count: React.PropTypes.number,
};
Pagers.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({
        page: React.PropTypes.string,
      }),
    }),
  }),
};
