import { shallow } from 'enzyme';
import React from 'react';

import { groupReqs, Group } from '../../../components/requirements/by-policy';

describe('<Group />', () => {
  const policy = { title: 'PolicyAAA', uri: 'http://example.com/aaa' };
  const group = [
    { req_id: '1.1', policy },
    { req_id: '1.2', policy },
    { req_id: '1.3', policy },
  ];
  const result = shallow(<Group group={group} />);

  it('includes all of the requirements', () => {
    const reqs = result.find('Requirement');
    expect(reqs).toHaveLength(3);
    expect(reqs.at(0).prop('requirement')).toEqual(group[0]);
    expect(reqs.at(1).prop('requirement')).toEqual(group[1]);
    expect(reqs.at(2).prop('requirement')).toEqual(group[2]);
  });

  it('includes the policy name', () => {
    expect(result.text()).toMatch(/PolicyAAA/);
  });

  it('includes a link to the policy', () => {
    expect(result.find('a').first().prop('href')).toEqual('http://example.com/aaa');
  });
});

describe('groupReqs()', () => {
  it('handles empty requirements', () => {
    expect(groupReqs([])).toEqual([]);
  });

  it('groups by policy', () => {
    const reqs = [
      { req_id: 'a', policy: { id: 1 } },
      { req_id: 'b', policy: { id: 1 } },
      { req_id: 'c', policy: { id: 2 } },
      { req_id: 'd', policy: { id: 3 } },
      { req_id: 'e', policy: { id: 3 } },
    ];
    expect(groupReqs(reqs)).toEqual([
      reqs.slice(0, 2), reqs.slice(2, 3), reqs.slice(3)]);
  });
});
