import { makeOptionLoader, redirectQuery, search } from '../lookup-search';
import api from '../api';

jest.mock('../api');


describe('search()', () => {
  it('uses the correct parameters for topics', () => {
    search('topics', 'some query here');
    expect(api.topics.fetch).toHaveBeenCalledWith({
      search: 'some query here', page: '1',
    });
  });

  it('uses the correct parameters for policies', () => {
    search('policies', 'some query here', '3');
    expect(api.policies.fetch).toHaveBeenCalledWith({
      search: 'some query here', page: '3',
    });
  });
});

describe('makeOptionLoader()', () => {
  it('queries the API for suggestions', () => {
    api.topics.fetch = jest.fn(() => Promise.resolve({ results: [
      { id: 4, name: 'four' }, { id: 9, name: 'nine' },
    ] }));

    const loader = makeOptionLoader('topics');
    return loader('term-here').then((result) => {
      expect(result).toEqual({
        options: [{ value: 4, label: 'four' }, { value: 9, label: 'nine' }],
      });
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
