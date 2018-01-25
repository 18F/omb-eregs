import { mount } from 'enzyme';
import React from 'react';

import NewPolicyView from '../../../components/homepage/new-policy-view';
import Policy from '../../../util/policy';

describe('<NewPolicyView />', () => {
  const policy = new Policy({
    id: 42,
    title_with_number: 'Title with A Number',
    issuance: '1900-01-04',
  });
  const result = mount(<NewPolicyView policy={policy} />);

  it('includes expected fields', () => {
    expect(result.text()).toMatch(/Title with A Number/);
    expect(result.text()).toMatch(/January 4, 1900/);
  });
  it('links to the right place', () => {
    const links = result.find('LinkRoutes');
    expect(links).toHaveLength(1);
    expect(links.at(0).prop('route')).toEqual('policies');
    expect(links.at(0).prop('params')).toEqual({ id__in: 42 });
  });
});
