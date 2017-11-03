import { shallow } from 'enzyme';
import React from 'react';

import PolicyLink from '../../../components/requirements/policy-link';

describe('<PolicyLink />', () => {
  it('renders using title_with_number from the policy prop', () => {
    const policy = { id: 10, title_with_number: 'fake-text' };
    const rendered = shallow(<PolicyLink policy={policy} />);
    const link = rendered.find('Link');
    expect(link.render().find('a').text()).toEqual('fake-text');
  });
});
