import { shallow } from 'enzyme';
import React from 'react';
import ExistingFiltersContainer from '../../../components/filters/existing-container';

describe('<ExistingFiltersContainer />', () => {
  it('contains the correct remove links', () => {
    const params = {
      topics: [{ id: 4, name: 'A' }, { id: 8, name: 'B' }],
      policies: [{ id: 1, title: 'C' }, { id: 3, title: 'D' }, { id: 5, title: 'E' }],
      agencies: [{ id: 9, name: 'F' }],
      fieldNames: { agencies: 'aaa', policies: 'ppp', search: 'sss', topics: 'ttt' },
      route: '',
      router: { query: {} },
    };

    const result = shallow(<ExistingFiltersContainer {...params} />);
    const links = result.find('withRoute(RemoveLinkContainer)');

    expect(links).toHaveLength(6);
    expect(links.map(l => l.prop('heading'))).toEqual([
      'Topic',
      'Topic',
      'Policy',
      'Policy',
      'Policy',
      'Agency',
    ]);
    expect(links.map(l => l.prop('idToRemove'))).toEqual([4, 8, 1, 3, 5, 9]);

    expect(result.find('withRoute(RemoveSearchContainer)')).toHaveLength(1);
  });
});
