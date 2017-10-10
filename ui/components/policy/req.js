import PropTypes from 'prop-types';
import React from 'react';

export default function Req({ highlighted, href, onClick, req }) {
  let meta = null;
  if (highlighted) {
    meta = (
      <div className="col col-4">
        Number: { req.req_id }
        <ul>
          { req.topics.map(t => <li key={t.id}>{t.name}</li>) }
        </ul>
      </div>
    );
  }
  const className = highlighted ? 'clearfix border' : 'clearfix';
  return (
    <div id={req.req_id} className={className}>
      <p className="col col-8">
        <a href={href} onClick={onClick}>{req.req_text}</a>
      </p>
      {meta}
    </div>
  );
}
Req.propTypes = {
  highlighted: PropTypes.bool,
  href: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  req: PropTypes.shape({
    req_id: PropTypes.string.isRequired,
    req_text: PropTypes.string.isRequired,
    topics: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};
Req.defaultProps = {
  highlighted: false,
};
