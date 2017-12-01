import { shallow } from 'enzyme';
import React from 'react';

import Policy from '../../../util/policy';
import PolicyView from '../../../components/policies/policy-view';

describe('<PolicyView />', () => {
  const basePolicy = {
    id: 1,
    title_with_number: 'Funky Policy',
    omb_policy_id: 'M-16-19',
    has_docnode: false,
    relevant_reqs: 1,
    total_reqs: 2,
  };

  it('does not link to policy if no docnode for it exists', () => {
    const policy = new Policy({
      ...basePolicy,
      has_docnode: false,
    });
    const result = shallow(<PolicyView policy={policy} topicsIds="" />);
    expect(result.find('h2 Link').exists()).toBeFalsy();
    expect(result.find('h2').text()).toEqual('Funky Policy');
  });

  it('links to policy if a docnode for it exists', () => {
    const policy = new Policy({
      ...basePolicy,
      has_docnode: true,
    });
    const result = shallow(<PolicyView policy={policy} topicsIds="" />);
    const link = result.find('h2 Link');
    expect(link.exists()).toBeTruthy();
    expect(link.prop('params')).toEqual({
      policyId: 'M-16-19',
    });
    expect(link.children().text()).toEqual('Funky Policy');
  });
});
