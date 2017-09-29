import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';

export function Metadata({ className, name, value, nullValue, separator }) {
  /**
   * Returns a div element that has className equal to the argument plus 'metadata', and content
   * that is either <name><separator><value> or, if value is null and nullValue is not, the content
   * is the nullValue argument.
   *
   * If value and nullValue are both null, returns null.
   */
  if (!value && !nullValue) {
    return null;
  }
  const classes = className.split(' ');
  const classString = classes.includes('metadata') ? className : `${classes.join(' ')} metadata`;
  const content = value ? `${name}${separator}${value}` : nullValue;
  return (
    <div className={classString}>
      {`${content}`}
    </div>);
}

Metadata.propTypes = {
  className: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  nullValue: PropTypes.string,
  separator: PropTypes.string,
};

Metadata.defaultProps = {
  value: '',
  nullValue: '',
  separator: ': ',
};


function TopicLink({ topic }) {
  return (
    <li className="inline">
      <Link route="requirements" params={{ topics__id__in: topic.id }}>
        <a>{ topic.name }</a>
      </Link>
    </li>
  );
}
TopicLink.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }).isRequired,
};


function PolicyLink({ policy }) {
  return (
    <div className="policy-title metadata">
      Policy title:
      {' '}
      <Link route="policies" params={{ id__in: policy.id }}>
        <a>{policy.title_with_number}</a>
      </Link>
    </div>
  );
}
PolicyLink.propTypes = {
  policy: PropTypes.shape({
    id: PropTypes.number,
    title_with_number: PropTypes.string,
  }).isRequired,
};

const badEntities = [
  'NA', 'N/A', 'Not Applicable', 'None', 'None Specified', 'unknown', 'TBA',
  'Cannot determine-Ask Mindy',
].map(e => e.toLowerCase());
/* Temporary "solution" to bad data: filter it out on the front end */
export function filterAppliesTo(text) {
  const normalized = (text || '').toLowerCase().trim();
  if (badEntities.includes(normalized)) {
    return null;
  }
  return text;
}


export default function Requirement({ requirement }) {
  // We could have multiple lines with the same text, so can't use a stable ID
  /* eslint-disable react/no-array-index-key */
  const reqTexts = requirement.req_text.split('\n').map((line, idx) => (
    <span key={idx} className="req-text-line mb1">{ line }<br /></span>
  ));
  /* eslint-enable react/no-array-index-key */
  return (
    <div className="req p2 clearfix max-width-3">
      <div className="req-text col col-12">
        { reqTexts }
        <div className="clearfix mt3">
          <PolicyLink policy={requirement.policy} />
          <Metadata
            className="omb-policy-id"
            name="OMB Policy ID"
            value={requirement.policy.omb_policy_id}
          />
          <Metadata
            className="issuance"
            name="Policy issuance"
            value={requirement.policy.issuance}
          />
          <Metadata
            className="requirement-id"
            name="Requirement ID"
            value={requirement.req_id}
          />
          <Metadata
            className="applies-to mr2"
            name="Applies to"
            value={filterAppliesTo(requirement.impacted_entity)}
          />
          <Metadata
            className="issuing-body"
            name="Issuing body"
            value={requirement.issuing_body}
          />
          <Metadata
            className="sunset-date"
            name="Sunset date"
            value={requirement.policy.sunset}
            nullValue="Sunset date: none"
            separator=" by "
          />
          <div className="topics metadata">
            <span>Topics: </span>
            <ul className="topics-list list-reset inline">
              { requirement.topics.map(topic =>
                <TopicLink key={topic.id} topic={topic} />) }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Requirement.propTypes = {
  requirement: PropTypes.shape({
    topics: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
    policy: PropTypes.shape({
      sunset: PropTypes.string,
    }),
    req_text: PropTypes.string,
    req_id: PropTypes.string,
  }).isRequired,
};
