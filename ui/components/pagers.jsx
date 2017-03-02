import React from 'react';
import { Link } from 'react-router';

export default function Pagers({ pathname, query, count }) {
  let prevPage = null;
  let nextPage = null;
  const pageInt = parseInt(query.page || '1', 10);
  const nextOffset = pageInt * 25;

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
      { nextPage }
    </div>
  );
}

Pagers.defaultProps = {
  pathname: '/',
  query: { page: '1' },
  count: 0,
};

Pagers.propTypes = {
  pathname: React.PropTypes.string,
  query: React.PropTypes.shape({
    page: React.PropTypes.string,
  }),
  count: React.PropTypes.number,
};
