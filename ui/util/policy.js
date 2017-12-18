import PropTypes from 'prop-types';

/**
 * The Policy class wraps the policy structure returned by the API
 * and adds a number of convenience methods to it.  It's intended to be
 * immutable; no state is stored in it.
 */

export default class Policy {
  constructor(initial) {
    this.hasDocnode = initial.hasDocnode || initial.has_docnode || false;
    this.id = initial.id || '';
    this.ombPolicyId = initial.ombPolicyId || initial.omb_policy_id || '';
    this.originalUrl = initial.originalUrl || initial.original_url || '';
    this.relevantReqs = initial.relevantReqs || initial.relevant_reqs || 0;
    this.titleWithNumber = initial.titleWithNumber || initial.title_with_number || '';
    this.totalReqs = initial.totalReqs || initial.total_reqs || 0;
    Object.freeze(this);
  }

  hasDocument() {
    return this.ombPolicyId && this.hasDocnode;
  }

  getDocumentLinkProps() {
    return {
      route: 'document',
      params: {
        policyId: this.ombPolicyId,
      },
    };
  }
}

Policy.shape = PropTypes.shape({
  id: PropTypes.number,
  title_with_number: PropTypes.string,
  relevant_reqs: PropTypes.number,
  total_reqs: PropTypes.number,
  has_docnode: PropTypes.bool,
  omb_policy_id: PropTypes.string,
});
