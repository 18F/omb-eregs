import { shallow } from 'enzyme';
import React from 'react';

import { PoliciesContainer } from '../../../components/policies/container';

describe('<PoliciesContainer />', () => {
  const location = { query: {
    some: 'value',
    requirements__topics__id__in: '1,6,9',
    page: '5',
  } };
  const pagedPolicies = {
    results: [{ thing: 1 }, { thing: 2 }],
    count: 2,
  };
  const result = shallow(React.createElement(
    PoliciesContainer, { location, pagedPolicies }));

  it('has a topics filter', () => {
    const filters = result.prop('filters');
    expect(filters).toHaveLength(1);

    expect(filters[0].props.query).toEqual(location.query);
    expect(filters[0].props.paramName).toEqual('requirements__topics__id__in');
  });

  it('has appropriate tabs', () => {
    const tabs = result.prop('tabs');
    expect(tabs).toHaveLength(2);

    const [reqTab, policyTab] = tabs;

    expect(reqTab.props.active).toBeFalsy();
    expect(reqTab.props.tabName).toBe('Requirements');

    expect(policyTab.props.active).toBeTruthy();
    expect(policyTab.props.tabName).toBe('Policies');
  });

  it('has correct pageContent', () => {
    const pageContent = result.prop('pageContent');

    expect(pageContent.props.policies).toEqual(pagedPolicies.results);
    expect(pageContent.props.count).toEqual(pagedPolicies.count);
  });
});
