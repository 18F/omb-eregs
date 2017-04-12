import React from 'react';

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
  value: React.PropTypes.string.isRequired,
  nullValue: React.PropTypes.string,
  separator: React.PropTypes.string,
};

Metadata.defaultProps = {
  nullValue: '',
  separator: ': ',
};


export default function Requirement({ requirement }) {
  // We could have multiple lines with the same text, so can't use a stable ID
  /* eslint-disable react/no-array-index-key */
  const reqTexts = requirement.req_text.split('\n').map((line, idx) => (
    <span key={idx} className="req-text-line mb1">{ line }<br /></span>
  ));
  /* eslint-enable react/no-array-index-key */
  return (
    <div className="req p2 clearfix max-width-3">
      <div className="req-id col col-1 mb2 mr1">
        {requirement.req_id}
      </div>
      <div className="req-text col col-10">
        { reqTexts }
        <div className="clearfix mt3">
          <Metadata
            className="applies-to mr2"
            name="Applies to"
            value={requirement.impacted_entity}
            nullValue="Applies to: unknown"
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
          <Metadata
            className="policy-title"
            name="Policy title"
            value={requirement.policy.title}
            nullValue="Policy title: none"
          />
          <Metadata
            className="issuance"
            name="Policy issuance"
            value={requirement.policy.issuance}
          />
          <Metadata
            className="omb-policy-id"
            name="OMB Policy ID"
            value={requirement.policy.omb_policy_id}
          />
          <div className="topics metadata">
            <span>Topics: </span>
            <ul className="topics-list list-reset inline">
              { requirement.keywords.map(keyword => (
                <li key={keyword.id} className="inline">
                  { keyword.name }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Requirement.defaultProps = {
  requirement: {
    keywords: [],
    policy: {},
    req_text: '',
    req_id: '',
  },
};

Requirement.propTypes = {
  requirement: React.PropTypes.shape({
    keywords: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
      name: React.PropTypes.string,
    })),
    policy: React.PropTypes.shape({
      sunset: React.PropTypes.string,
    }),
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  }),
};
