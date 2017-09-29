import { shallow } from 'enzyme';
import React from 'react';

import { PoliciesContainer, RequirementsTab } from '../../pages/policies';

describe('<PoliciesContainer />', () => {
  const pagedPolicies = {
    results: [{ thing: 1 }, { thing: 2 }],
    count: 2,
  };
  const result = shallow(<PoliciesContainer pagedPolicies={pagedPolicies} />);

  it('has a topics filter controls', () => {
    const controls = result.prop('filterControls');
    expect(controls).toHaveLength(1);
    expect(controls[0].props.heading).toEqual('Topics');

    const selector = controls[0].props.selector;
    expect(selector.props.insertParam).toEqual('requirements__topics__id__in');
    expect(selector.props.lookup).toEqual('topics');
  });

  it('has two tabs with correct types', () => {
    const tabs = result.prop('tabs');
    expect(tabs).toHaveLength(2);

    const [reqTab, policyTab] = tabs;

    expect(reqTab.type.displayName).toEqual('withRoute(RequirementsTab)');

    expect(policyTab.props.active).toBeTruthy();
    expect(policyTab.props.tabName).toBe('Policies');
  });

  it('has correct pageContent', () => {
    const pageContent = result.prop('pageContent');

    expect(pageContent.props.policies).toEqual(pagedPolicies.results);
    expect(pageContent.props.count).toEqual(pagedPolicies.count);
  });

  it('has configured selectedFilters', () => {
    const selectedFilters = result.prop('selectedFilters');

    expect(selectedFilters.props.fieldNames).toHaveProperty('policies');
    expect(selectedFilters.props.fieldNames).toHaveProperty('search');
    expect(selectedFilters.props.fieldNames).toHaveProperty('topics');
  });
});


describe('<RequirementsTab />', () => {
  const router = {
    pathname: '',
    query: {
      issuance__gt: '2015-01-01',
      requirements__verb__icontains: 'must',
      requirements__topics__id__in: '1,6,9',
      page: '5',
    },
  };
  const result = shallow(<RequirementsTab router={router} />);

  it('is a configured TabView', () => {
    expect(result.name()).toBe('TabView');
    expect(result.prop('active')).toBeFalsy();
    expect(result.prop('route')).toBe('requirements');
    expect(result.prop('tabName')).toBe('Requirements');
  });
  it('transforms the query', () => {
    expect(result.prop('params')).toEqual({
      policy__issuance__gt: '2015-01-01',
      verb__icontains: 'must',
      topics__id__in: '1,6,9',
    });
  });
});
