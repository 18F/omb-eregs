import PropTypes from 'prop-types';

/**
 * The Policy class wraps the policy structure returned by the API
 * and adds a number of convenience methods to it.  It's intended to be
 * immutable; no state is stored in it, and calling JSON.stringify() on
 * it yields the same policy structure it was initialized with.
 */

export default class Policy {
  constructor(policy) {
    PropTypes.checkPropTypes(Policy.propTypes, policy, 'property', 'Policy');
    Object.assign(this, policy);
    Object.freeze(this);
  }

  hasDocument() {
    return this.omb_policy_id && this.has_docnode;
  }

  getDocumentLinkProps() {
    return {
      route: 'document',
      params: {
        policyId: this.omb_policy_id,
      },
    };
  }
}

Policy.propTypes = {
  id: PropTypes.number,
  title_with_number: PropTypes.string,
  relevant_reqs: PropTypes.number,
  total_reqs: PropTypes.number,
  has_docnode: PropTypes.bool,
  omb_policy_id: PropTypes.string,
};

Policy.shape = PropTypes.shape(Policy.propTypes);
