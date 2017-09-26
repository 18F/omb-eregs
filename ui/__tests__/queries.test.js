import { mount } from 'enzyme';
import React from 'react';

import { formatIssuance, homepageData } from '../queries';
import NewPolicyView from '../components/homepage/new-policy-view';
import api from '../api';

jest.mock('../api');


describe('formatIssuance', () => {
  it('handles reasonable input', () => {
    const result = formatIssuance({ issuance: '2001-12-20' });
    expect(result.issuance_pretty).toEqual('December 20, 2001');
  });
  it('fails gracefully', () => {
    const result = formatIssuance({ issuance: null });
    expect(result.issuance_pretty).toEqual('Invalid date');
  });
});

describe('homepageData', () => {
  it('makes the correct request', () => {
    api.topics.fetchResults.mockImplementationOnce(() => Promise.resolve([]));
    return homepageData.recentPolicies().then(() => {
      expect(api.policies.fetchResults).toHaveBeenCalledWith(
        { ordering: '-issuance' });
    });
  });
  it('trims to the appropriate length', () => {
    api.topics.fetchResults.mockImplementationOnce(() =>
      Promise.resolve([1, 2, 3, 4, 5, 6, 7].map(id => ({ id }))));
    return homepageData.recentPolicies().then((result) => {
      expect(result.map(r => r.id)).toEqual([1, 2, 3, 4]);
    });
  });
  it('formats issuance date', () => {
    api.topics.fetchResults.mockImplementationOnce(() => Promise.resolve([
      { issuance: '2002-03-04' },
      { issuance: '2020-11-10' },
    ]));
    return homepageData.recentPolicies().then((result) => {
      expect(result.map(r => r.issuance_pretty)).toEqual([
        'March 4, 2002',
        'November 10, 2020',
      ]);
    });
  });
});

describe('<NewPolicyView />', () => {
  const el = React.createElement(NewPolicyView, { policy: {
    id: 42,
    title_with_number: 'Title with A Number',
    issuing_body: 'Somebody',
    issuance_pretty: 'January 4, 1900',
  } });
  const result = mount(el);

  it('includes expected fields', () => {
    expect(result.text()).toMatch(/Title with A Number/);
    expect(result.text()).toMatch(/Somebody/);
    expect(result.text()).toMatch(/January 4, 1900/);
  });
  it('links to the right place', () => {
    const links = result.find('Link');
    expect(links).toHaveLength(1);
    expect(links.at(0).prop('to')).toEqual({
      pathname: '/policies', query: { id__in: 42 },
    });
  });
});
