import React from 'react';
import { Link } from 'react-router';

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
  className: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.string,
  nullValue: React.PropTypes.string,
  separator: React.PropTypes.string,
};

Metadata.defaultProps = {
  value: '',
  nullValue: '',
  separator: ': ',
};


function TopicLink({ topic }) {
  const linkTo = {
    pathname: '/requirements',
    query: { topics__id__in: topic.id },
  };
  return (
    <li className="inline">
      <Link to={linkTo}>{ topic.name }</Link>
    </li>
  );
}
TopicLink.propTypes = {
  topic: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  }).isRequired,
};


function PolicyLink({ policy }) {
  const linkTo = {
    pathname: '/policies',
    query: { id__in: policy.id },
  };
  return (
    <div className="policy-title metadata">
      Policy title:
      {' '}
      <Link to={linkTo}>{policy.title_with_number}</Link>
    </div>
  );
}
PolicyLink.propTypes = {
  policy: React.PropTypes.shape({
    id: React.PropTypes.number,
    title_with_number: React.PropTypes.string,
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
  requirement: React.PropTypes.shape({
    topics: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
      name: React.PropTypes.string,
    })),
    policy: React.PropTypes.shape({
      sunset: React.PropTypes.string,
    }),
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  }).isRequired,
};
