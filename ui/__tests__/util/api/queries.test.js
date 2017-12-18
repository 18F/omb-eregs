import {
  cleanSearchParams,
  documentData,
  formatIssuance,
  homepageData,
  policiesData,
  redirectQuery,
  requirementsData,
} from '../../../util/api/queries';
import endpoints from '../../../util/api/endpoints';

jest.mock('../../../util/api/endpoints');

const error404 = new Error('Not Found');
error404.response = { status: 404 };

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

describe('documentData()', () => {
  beforeEach(() => {
    endpoints.document.fetchOne.mockImplementationOnce(
      async () => ({ meta: { policy: { issuance: '2012-12-12' } } }),
    );
  });
  it('hits the correct url', async () => {
    const result = await documentData({ query: { policyId: '123' } });
    expect(endpoints.document.fetchOne).toHaveBeenCalledWith('123');
    expect(result).toEqual({
      docNode: {
        meta: {
          policy: {
            issuance: '2012-12-12',
            issuance_pretty: 'December 12, 2012',
          },
        },
      },
    });
  });
});

describe('policiesData()', () => {
  it('passes up 404s', async () => {
    endpoints.policies.fetch.mockImplementationOnce(() => {
      throw error404;
    });

    const result = await policiesData({ query: { page: 99999 } });
    expect(result).toEqual({ statusCode: 404 });
  });
});

describe('requirementsData()', () => {
  it('passes up 404s', async () => {
    endpoints.requirements.fetch.mockImplementationOnce(() => {
      throw error404;
    });

    const result = await requirementsData({ query: { page: 99999 } });
    expect(result).toEqual({ statusCode: 404 });
  });
});
