import { shallow } from 'enzyme';
import React from 'react';

import { RequirementsContainer } from '../../../components/requirements/container';

describe('<RequirementsContainer />', () => {
  const location = { query: {
    policy__issuance__gt: '2015-01-01',
    verb__icontains: 'must',
    topics__id__in: '1,6,9',
    page: '5',
  } };
  const pagedReqs = {
    results: [{ thing: 1 }, { thing: 2 }],
    count: 2,
  };
  const result = shallow(React.createElement(
    RequirementsContainer, { location, pagedReqs }));

  it('has a topics filter controls', () => {
    const controls = result.prop('filterControls');
    expect(controls).toHaveLength(1);
    expect(controls[0].props.heading).toEqual('Topics');

    const autocompleter = controls[0].props.autocompleter;
    expect(autocompleter.props.insertParam).toEqual('topics__id__in');
    expect(autocompleter.props.lookup).toEqual('topics');
  });

  describe('its tabs', () => {
    it('has two tabs with correct names', () => {
      const tabs = result.prop('tabs');
      expect(tabs).toHaveLength(2);

      const [reqTab, policyTab] = tabs;

      expect(reqTab.props.active).toBeTruthy();
      expect(reqTab.props.tabName).toBe('Requirements');

      expect(policyTab.props.active).toBeFalsy();
      expect(policyTab.props.tabName).toBe('Policies');
    });

    it('transforms the query for the policies tab', () => {
      const policyTab = result.prop('tabs')[1];
      const link = policyTab.props.link;
      expect(link).toEqual({
        pathname: '/policies',
        query: {
          issuance__gt: '2015-01-01',
          requirements__verb__icontains: 'must',
          requirements__topics__id__in: '1,6,9',
        },
      });
    });
  });

  it('has correct pageContent', () => {
    const pageContent = result.prop('pageContent');

    expect(pageContent.props.requirements).toEqual(pagedReqs.results);
    expect(pageContent.props.count).toEqual(pagedReqs.count);
  });

  it('has configured selectedFilters', () => {
    const selectedFilters = result.prop('selectedFilters');

    expect(selectedFilters.props.fieldNames).toHaveProperty('policies');
    expect(selectedFilters.props.fieldNames).toHaveProperty('topics');
    expect(selectedFilters.props.query).toEqual(location.query);
  });
});

