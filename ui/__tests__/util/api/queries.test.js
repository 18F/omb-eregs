import {
  cleanSearchParams,
  formatIssuance,
  homepageData,
  policyData,
  redirectQuery,
} from '../../../util/api/queries';
import endpoints from '../../../util/api/endpoints';

jest.mock('../../../util/api/endpoints');

describe('formatIssuance', () => {
  it('handles reasonable input', () => {
    const result = formatIssuance({ issuance: '2001-12-20' });
    expect(result.issuance_pretty).toEqual('December 20, 2001');
  });
  it('fails gracefully', () => {
    const result = formatIssuance({ issuance: null });
    expect(result.issuance_pretty).toEqual('Invalid date');
  });
});

describe('homepageData', () => {
  it('makes the correct request', () => {
    endpoints.topics.fetchResults.mockImplementationOnce(() => Promise.resolve([]));
    return homepageData().then(() => {
      expect(endpoints.policies.fetchResults).toHaveBeenCalledWith({ ordering: '-issuance' });
    });
  });
  it('trims to the appropriate length', () => {
    endpoints.topics.fetchResults.mockImplementationOnce(() =>
      Promise.resolve([1, 2, 3, 4, 5, 6, 7].map(id => ({ id }))),
    );
    return homepageData().then(({ recentPolicies }) => {
      expect(recentPolicies.map(r => r.id)).toEqual([1, 2, 3, 4]);
    });
  });
  it('formats issuance date', () => {
    endpoints.topics.fetchResults.mockImplementationOnce(() =>
      Promise.resolve([{ issuance: '2002-03-04' }, { issuance: '2020-11-10' }]),
    );
    return homepageData().then(({ recentPolicies }) => {
      expect(recentPolicies.map(r => r.issuance_pretty)).toEqual([
        'March 4, 2002',
        'November 10, 2020',
      ]);
    });
  });
});

describe('cleanSearchParams()', () => {
  const query = {
    insertParam: 'ins',
    lookup: 'topics',
    q: 'something',
    redirectQuery__et: 'c',
    redirectQuery__param: 'value',
    redirectRoute: 'requirements',
  };

  it('does not raise an error when all fields are present', () => {
    expect(() => cleanSearchParams(query)).not.toThrow();
  });

  ['insertParam', 'lookup', 'redirectRoute'].forEach((param) => {
    it(`raises an error when ${param} is not present`, () => {
      const queryCopy = Object.assign({}, query);
      delete queryCopy[param];
      expect(() => cleanSearchParams(queryCopy)).toThrow();
    });
    it(`raises an error when ${param} is empty`, () => {
      const queryCopy = Object.assign({}, query, { [param]: '' });
      expect(() => cleanSearchParams(queryCopy)).toThrow();
    });
  });

  it('raised an error when the route is not valid', () => {
    const queryCopy = Object.assign({}, query, { redirectRoute: 'nonsense' });
    expect(() => cleanSearchParams(queryCopy)).toThrow(/Invalid "redirectRoute"/);
  });

  it('gives cleans the parameter values', () => {
    expect(cleanSearchParams(query)).toEqual({
      q: 'something',
      insertParam: 'ins',
      redirect: {
        route: 'requirements',
        query: {
          param: 'value',
          et: 'c',
        },
      },
      lookup: 'topics',
      page: '1',
    });
  });
});

describe('redirectQuery()', () => {
  it('updates an empty query', () => {
    const result = redirectQuery({ some: 'thing' }, 'myParam', 3);
    expect(result).toEqual({ some: 'thing', myParam: '3' });
  });
  it('updates a populated query', () => {
    const query = { some: 'thing', myParam: '1,7,9' };
    const result = redirectQuery(query, 'myParam', 3);
    expect(result).toEqual({ some: 'thing', myParam: '1,7,9,3' });
  });
});

describe('policyData()', () => {
  beforeEach(() => {
    endpoints.requirements.fetch.mockImplementationOnce(
      () => Promise.resolve({ count: 1, results: 'data-goes-here' }));
    endpoints.policies.fetchOne.mockImplementationOnce(
      () => Promise.resolve({ issuance: '2000-01-02' }));
  });

  it('hits the correct urls', async () => {
    await policyData({ query: { policyId: '3' } });
    expect(endpoints.requirements.fetch).toHaveBeenCalledWith({ policy_id: '3', page: '1' });
    expect(endpoints.policies.fetchOne).toHaveBeenCalledWith('3');
  });
  it('returns the correct results', async () => {
    const results = await policyData({ query: {} });
    expect(results).toEqual({
      pagedReqs: { count: 1, results: 'data-goes-here' },
      policy: {
        issuance: '2000-01-02',
        issuance_pretty: 'January 2, 2000',
      },
    });
  });
  it('will pass the page number', async () => {
    await policyData({ query: { page: '5', policyId: '3' } });
    expect(endpoints.requirements.fetch).toHaveBeenCalledWith({ policy_id: '3', page: '5' });
  });
  it('passes up 404s', async () => {
    const err = new Error('Not found');
    err.response = { status: 404 };
    endpoints.policies.fetchOne.mockReset();
    endpoints.policies.fetchOne.mockImplementationOnce(() => {
      throw err;
    });

    const result = await policyData({ query: {} });
    expect(result).toEqual({ statusCode: 404 });
  });
});
