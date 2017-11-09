import { shallow } from 'enzyme';
import React from 'react';
import { PoliciesContainer } from '../../pages/policies';

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

  it('has no tabs', () => {
    const tabs = result.prop('tabs');
    expect(tabs).toBeNull();
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
