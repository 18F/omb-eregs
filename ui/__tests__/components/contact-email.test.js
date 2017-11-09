import { mount } from 'enzyme';
import React from 'react';
import { email, ContactEmail } from '../../components/contact-email';

const expr = `a[href="mailto:${email}"]`;

describe('<ContactEmail />', () => {
  describe('when given no props', () => {
    const mailtext = ContactEmail.defaultProps.text;
    expect(mailtext).toBeTruthy(); // ContactEmail.defaultProps.text should have a value.
    const result = mount(<ContactEmail />);
    it('Has the expected href value', () => {
      expect(result.find(expr).length).toEqual(1);
    });
    it('Has the expected text value', () => {
      expect(result.find(expr).text()).toEqual(mailtext);
    });
  });
  describe('when given a text prop', () => {
    const result = mount(<ContactEmail text="something" />);
    it('Has the expected href value', () => {
      expect(result.find(expr).length).toEqual(1);
    });
    it('Has the expected text value', () => {
      expect(result.find(expr).text()).toEqual('something');
    });
  });
});
