import { mount } from 'enzyme';
import React from 'react';

import Tabs from '../../../components/requirements/tabs';
import mockRouter from '../../util/mockRouter';

describe('<Tabs />', () => {
  const location = { query: { some: 'value', another: 'here', page: '5' } };
  const routes = [
    {}, { path: '/' },
    { path: 'parent',
      childRoutes: [
        { path: 'child1', tabName: 'Tab 1' },
        { path: 'childB', tabName: 'Tab B' },
        { path: 'other', tabName: 'Other' },
        { path: 'one-more', tabName: 'Yet Another' }] },
    { path: 'childB' },
  ];
  const context = { router: mockRouter(location, routes) };
  const tabs = mount(<Tabs />, { context }).find('Tab');

  it('includes all peer routes', () => {
    expect(tabs).toHaveLength(4);
    expect(tabs.at(0).text()).toEqual('Tab 1');
    expect(tabs.at(1).text()).toEqual('Tab B');
    expect(tabs.at(2).text()).toEqual('Other');
    expect(tabs.at(3).text()).toEqual('Yet Another');
  });
  it('has links for the peers', () => {
    expect(tabs.at(0).find('Link').exists()).toBe(true);
    expect(tabs.at(1).find('Link').exists()).toBe(false);
    expect(tabs.at(2).find('Link').exists()).toBe(true);
    expect(tabs.at(3).find('Link').exists()).toBe(true);
  });
  it('has links which include the query params', () => {
    expect(tabs.at(2).find('Link').first().prop('to')).toEqual({
      pathname: '/parent/other', query: { some: 'value', another: 'here' },
    });
  });
});
