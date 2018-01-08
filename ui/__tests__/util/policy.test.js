import Policy from '../../util/policy';

function policy(props = {}) {
  return new Policy({
    id: 1,
    has_docnodes: false,
    omb_policy_id: 'M-16-19',
    ...props,
  });
}

describe('Policy', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(policy())).toBe(true);
  });

  it('copies properties from passed-in object', () => {
    expect(policy({ id: 4 }).id).toBe(4);
  });

  describe('hasDocument()', () => {
    it('returns false if the policy has no document', () => {
      expect(policy({ has_docnodes: false }).hasDocument()).toBe(false);
    });

    it('returns true if the policy has a document', () => {
      expect(policy({ has_docnodes: true }).hasDocument()).toBe(true);
    });
  });

  describe('getDocumentLinkProps()', () => {
    it('returns link props with OMB policy id', () => {
      expect(policy({
        has_docnodes: true,
        omb_policy_id: 'blarg',
      }).getDocumentLinkProps()).toEqual({
        route: 'document',
        params: { policyId: 'blarg' },
      });
    });
  });

  describe('issuancePretty()', () => {
    it('handles reasonable input', () => {
      const policyObj = new Policy({ issuance: '2001-12-20' });
      expect(policyObj.issuancePretty()).toEqual('December 20, 2001');
    });
    it('fails gracefully with null', () => {
      const policyObj = new Policy({ issuance: null });
      expect(policyObj.issuancePretty()).toEqual('Invalid date');
    });
    it('fails gracefully with a nonsense string', () => {
      const policyObj = new Policy({ issuance: 'sjdnajkshdhasj' });
      expect(policyObj.issuancePretty()).toEqual('Invalid date');
    });
  });
});
