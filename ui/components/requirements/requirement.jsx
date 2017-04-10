import React from 'react';

export default function Requirement({ requirement }) {
  // We could have multiple lines with the same text, so can't use a stable ID
  /* eslint-disable react/no-array-index-key */
  const reqTexts = requirement.req_text.split('\n').map((line, idx) => (
    <span key={idx} className="req-text-line mb1">{ line }<br /></span>
  ));
  /* eslint-enable react/no-array-index-key */
  const sunsetString = requirement.policy.sunset ? 'Sunset date by $requirement.policy.sunset' : 'Sunset date: none';
  return (
    <div className="req p2 clearfix max-width-3">
      <div className="req-id col col-1 mb2 mr1">
        {requirement.req_id}
      </div>
      <div className="req-text col col-10">
        { reqTexts }
        <div className="clearfix mt3">
          <div className="applies-to mr2 metadata">
            Applies to: [not implemented]
          </div>
          { requirement.issuing_body ? (
            <div className="issuing-body metadata">
              Issuing body: { requirement.issuing_body }
            </div>
          ) : (
            ''
          ) }
          <div className="sunset-date metadata">
            { sunsetString }
          </div>
          <div className="policy-title metadata">
            Policy title: { requirement.policy.title || 'none' }
          </div>
          { requirement.policy.issuance ? (
            <div className="issuance metadata">
              Policy issuance: { requirement.policy.issuance }
            </div>
          ) : (
            ''
          ) }
          { requirement.policy.omb_policy_id ? (
            <div className="omb-policy-id metadata">
              OMB Policy ID: { requirement.policy.omb_policy_id }
            </div>
          ) : (
            ''
          ) }
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
