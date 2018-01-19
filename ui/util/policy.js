import moment from 'moment';
/**
 * The Policy class wraps the policy structure returned by the API
 * and adds a number of convenience methods to it.  It's intended to be
 * immutable; no state is stored in it.
 */

// See https://momentjs.com/docs/#/displaying/ for options
const DATE_FORMAT = 'MMMM D, YYYY';

export default class Policy {
  constructor(initial) {
    this.hasDocnodes = initial.hasDocnodes || initial.has_docnodes || false;
    this.id = initial.id || '';
    this.issuance = initial.issuance || '';
    this.issuingBody = initial.issuingBody || initial.issuing_body || '';
    this.ombPolicyId = initial.ombPolicyId || initial.omb_policy_id || '';
    this.originalUrl = initial.originalUrl || initial.original_url || '';
    this.relevantReqs = initial.relevantReqs || initial.relevant_reqs || 0;
    this.title = initial.title || '';
    this.titleWithNumber = initial.titleWithNumber || initial.title_with_number || '';
    this.totalReqs = initial.totalReqs || initial.total_reqs || 0;
    Object.freeze(this);
  }

  hasDocument() {
    return this.ombPolicyId && this.hasDocnodes;
  }

  getDocumentLinkProps() {
    return {
      route: 'document',
      params: {
        policyId: this.ombPolicyId,
      },
    };
  }

  issuancePretty() {
    return moment(this.issuance, 'YYYY-MM-DD').format(DATE_FORMAT);
  }
}
