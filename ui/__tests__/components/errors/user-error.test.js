import { shallow } from 'enzyme';
import React from 'react';

import UserError from '../../../components/errors/user-error';

describe('<UserError />', () => {
  it('has expected milestones', () => {
    const result = shallow(<UserError message="This is my message" />)
      .children()
      .first();
    expect(result.text()).toMatch(/Invalid Request/);
    expect(result.text()).toMatch(/This is my message/);
    expect(result.find('Link').children().text()).toBe('Return home');
  });
});
