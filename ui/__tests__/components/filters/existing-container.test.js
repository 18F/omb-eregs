import { shallow } from 'enzyme';
import React from 'react';

import { ExistingFiltersContainer, RemoveLinkContainer, RemoveSearchContainer } from '../../../components/filters/existing-container';
import mockRouter from '../../util/mockRouter';


describe('<ExistingFiltersContainer />', () => {
  it('contains the correct remove links', () => {
    const result = shallow(React.createElement(ExistingFiltersContainer, {
      topics: [{ id: 4, name: 'A' }, { id: 8, name: 'B' }],
      policies: [
        { id: 1, title: 'C' }, { id: 3, title: 'D' }, { id: 5, title: 'E' }],
      agencies: [{ id: 9, name: 'F' }],
      fieldNames: { agencies: 'aaa', policies: 'ppp', search: 'sss', topics: 'ttt' } }));
    const links = result.find('RemoveLinkContainer');

    expect(links).toHaveLength(6);
    expect(links.map(l => l.prop('heading'))).toEqual([
      'Topic', 'Topic', 'Policy', 'Policy', 'Policy', 'Agency']);
    expect(links.map(l => l.prop('idToRemove'))).toEqual([4, 8, 1, 3, 5, 9]);

    expect(result.find('RemoveSearchContainer')).toHaveLength(1);
  });
});

describe('<RemoveLinkContainer />', () => {
  it('calculates the correct link', () => {
    const params = {
      existing: [1, 7, 10],
      field: 'someField',
      heading: 'FieldName',
      idToRemove: 7,
      name: 'A Value',
    };
    const context = { router: mockRouter({
      pathname: '/policies',
      query: { page: '3', some: 'stuff', someField: '1,7,10' },
    }) };
    const result = shallow(
      React.createElement(RemoveLinkContainer, params), { context });

    expect(result.prop('linkToRemove')).toEqual({
      pathname: '/policies', query: { some: 'stuff', someField: '1,10' } });
  });
});

describe('<RemoveSearchContainer />', () => {
  it('calculates the correct link', () => {
    const params = { field: 'someField' };
    const context = { router: mockRouter({
      pathname: '/policies',
      query: { page: '3', some: 'stuff', someField: 'My Search Term' },
    }) };
    const result = shallow(
      React.createElement(RemoveSearchContainer, params), { context });

    expect(result.prop('linkToRemove')).toEqual({
      pathname: '/policies', query: { some: 'stuff' } });
  });
});
