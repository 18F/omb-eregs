import { shallow } from 'enzyme';
import React from 'react';

import UserError from '../../../components/errors/user-error';

describe('<UserError />', () => {
  it('has expected milestones', () => {
    const wrapped = shallow(<UserError message="This is my message" />);
    expect(wrapped.name()).toBe('HeaderFooter');
    const text = wrapped.childAt(0).text();
    expect(text).toMatch(/Invalid Request/);
    expect(text).toMatch(/This is my message/);
    expect(text).toMatch(/Return home/);
  });
});
