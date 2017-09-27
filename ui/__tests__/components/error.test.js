import { shallow } from 'enzyme';
import React from 'react';

import ErrorView, { FourOhFour, UnexpectedError, UserError } from '../../components/error';


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

describe('<FourOhFour />', () => {
  it('has expected milestones', () => {
    const wrapped = shallow(<FourOhFour />);
    expect(wrapped.name()).toBe('HeaderFooter');
    const text = wrapped.childAt(0).text();
    expect(text).toMatch(/We can’t find the page/); // note the smart quote
    expect(text).toMatch(/contact us/);
    expect(text).toMatch(/Return home/);
  });
});

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

describe('<UnexpectedError />', () => {
  it('has the correct status code', () => {
    const text = shallow(<UnexpectedError statusCode={502} />).text();
    expect(text).toMatch(/Bad Gateway/);
    expect(text).not.toMatch(/Unexpected error/);
    expect(text).toMatch(/homepage/);
    expect(text).toMatch(/contact us/);
  });

  it('works without a status code', () => {
    const text = shallow(<UnexpectedError />).text();
    expect(text).not.toMatch(/Bad Gateway/);
    expect(text).toMatch(/Unexpected error/);
    expect(text).toMatch(/homepage/);
    expect(text).toMatch(/contact us/);
  });
});
