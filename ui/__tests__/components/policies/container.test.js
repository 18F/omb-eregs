import { shallow } from 'enzyme';
import React from 'react';

import { PoliciesContainer } from '../../../components/policies/container';

describe('<PoliciesContainer />', () => {
  const location = { query: {
    issuance__gt: '2015-01-01',
    requirements__verb__icontains: 'must',
    requirements__topics__id__in: '1,6,9',
    page: '5',
  } };
  const pagedPolicies = {
    results: [{ thing: 1 }, { thing: 2 }],
    count: 2,
  };
  const result = shallow(React.createElement(
    PoliciesContainer, { location, pagedPolicies }));

  it('has a topics filter controls', () => {
    const controls = result.prop('filterControls');
    expect(controls).toHaveLength(1);

    expect(controls[0].props.query).toEqual(location.query);
    expect(controls[0].props.paramName).toEqual('requirements__topics__id__in');
  });


  describe('its tabs', () => {
    it('has two tabs with correct names', () => {
      const tabs = result.prop('tabs');
      expect(tabs).toHaveLength(2);

      const [reqTab, policyTab] = tabs;

      expect(reqTab.props.active).toBeFalsy();
      expect(reqTab.props.tabName).toBe('Requirements');

      expect(policyTab.props.active).toBeTruthy();
      expect(policyTab.props.tabName).toBe('Policies');
    });

    it('transforms the query for the requirements tab', () => {
      const reqTab = result.prop('tabs')[0];
      const link = reqTab.props.link;
      expect(link).toEqual({
        pathname: '/requirements',
        query: {
          policy__issuance__gt: '2015-01-01',
          verb__icontains: 'must',
          topics__id__in: '1,6,9',
        },
      });
    });
  });

  it('has correct pageContent', () => {
    const pageContent = result.prop('pageContent');

    expect(pageContent.props.policies).toEqual(pagedPolicies.results);
    expect(pageContent.props.count).toEqual(pagedPolicies.count);
  });
});
