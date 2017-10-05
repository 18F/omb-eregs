import { shallow } from 'enzyme';
import React from 'react';

import ErrorView from '../../components/error';

describe('<ErrorView />', () => {
  it('renders a 404', () => {
    const result = shallow(<ErrorView statusCode={404} />);
    expect(result.name()).toBe('FourOhFour');
  });
  it('renders a 400', () => {
    const error = new Error('Oh noes!');
    error.statusCode = 400;
    const result = shallow(<ErrorView err={error} />);
    expect(result.name()).toBe('UserError');
    expect(result.prop('message')).toBe('Oh noes!');
  });
  it('renders a 500', () => {
    const result = shallow(<ErrorView statusCode={1234} />);
    expect(result.name()).toBe('UnexpectedError');
    expect(result.prop('statusCode')).toBe(1234);
  });
});
