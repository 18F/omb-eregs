import PropTypes from 'prop-types';
import React from 'react';


export default function PageCounter({ count, page, pageSize }) {
  const intPage = /^\d+$/.test(page) ? parseInt(page, 10) : 1;
  const lastPage = Math.ceil(count / pageSize) || 1;
  return <span>page {intPage} of {lastPage}</span>;
}
PageCounter.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.string,
  pageSize: PropTypes.number,
};
PageCounter.defaultProps = {
  page: '1',
  pageSize: 25,
};
