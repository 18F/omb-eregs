import PropTypes from 'prop-types';
import React from 'react';
import Metadata from '../requirements/metadata';
import { filterAppliesTo } from '../requirements/requirement';
import TopicLink from '../requirements/topic-link';

export default function Req({ highlighted, href, onClick, req }) {
  let meta = null;
  if (highlighted) {
    meta = (
      <div className="req col col-4">
        <Metadata className="requirement-id" name="Requirement ID" value={req.req_id} />
        <Metadata
          className="applies-to mr2"
          name="Applies to"
          value={filterAppliesTo(req.impacted_entity)}
        />
        <Metadata className="issuing-body" name="Issuing body" value={req.issuing_body} />
        <div className="topics metadata">
          <span>Topics: </span>
          <ul className="topics-list list-reset inline">
            {req.topics.map(topic => <TopicLink key={topic.id} topic={topic} route="policies" />)}
          </ul>
        </div>
      </div>
    );
  }
  const className = highlighted ? 'clearfix border' : 'clearfix';
  // We avoid "Link" here as we don't want to trigger AJAXy loading
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
        route: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
};

Req.defaultProps = {
  highlighted: false,
};
