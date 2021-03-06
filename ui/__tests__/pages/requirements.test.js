import { shallow } from 'enzyme';
import React from 'react';

import { PoliciesTab, RequirementsContainer } from '../../pages/requirements';

describe('<RequirementsContainer />', () => {
  const pagedReqs = {
    results: [{ thing: 1 }, { thing: 2 }],
    count: 2,
  };
  const result = shallow(<RequirementsContainer pagedReqs={pagedReqs} />)
    .find('SearchFilterView');

  it('has a topics filter controls', () => {
    const controls = result.prop('filterControls');
    expect(controls).toHaveLength(1);
    expect(controls[0].props.heading).toEqual('Topics');

    const selector = controls[0].props.selector;
    expect(selector.props.insertParam).toEqual('topics__id__in');
    expect(selector.props.lookup).toEqual('topics');
  });

  it('has two tabs with correct types', () => {
    const tabs = shallow(result.prop('tabs'));

    expect(tabs.find('TabView')).toHaveLength(1);
    const tabView = tabs.find('TabView').first();
    expect(tabView.prop('active')).toBeTruthy();
    expect(tabView.prop('tabName')).toBe('Requirements');

    expect(tabs.find('withRoute(PoliciesTab)')).toHaveLength(1);
  });

  it('has correct pageContent', () => {
    const pageContent = result.prop('pageContent');

    expect(pageContent.props.requirements).toEqual(pagedReqs.results);
    expect(pageContent.props.count).toEqual(pagedReqs.count);
  });

  it('has configured selectedFilters', () => {
    const selectedFilters = result.prop('selectedFilters');

    expect(selectedFilters.props.fieldNames).toHaveProperty('policies');
    expect(selectedFilters.props.fieldNames).toHaveProperty('search');
    expect(selectedFilters.props.fieldNames).toHaveProperty('topics');
  });
});


describe('<PoliciesTab />', () => {
  const router = {
    pathname: '',
    query: {
      policy__issuance__gt: '2015-01-01',
      verb__icontains: 'must',
      topics__id__in: '1,6,9',
      page: '5',
    },
  };
  const result = shallow(<PoliciesTab router={router} />);

  it('is a configured TabView', () => {
    expect(result.name()).toBe('TabView');
    expect(result.prop('active')).toBeFalsy();
    expect(result.prop('route')).toBe('policies');
    expect(result.prop('tabName')).toBe('Policies');
  });
  it('transforms the query', () => {
    expect(result.prop('params')).toEqual({
      issuance__gt: '2015-01-01',
      requirements__verb__icontains: 'must',
      requirements__topics__id__in: '1,6,9',
    });
  });
});
