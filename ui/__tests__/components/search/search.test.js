import { shallow } from 'enzyme';
import React from 'react';

import { Search } from '../../../components/search/search';

describe('<Search />', () => {
  describe('actionPath()', () => {
    it('returns /requirements/ by default', () => {
      const router = { pathname: '/no-such-path', query: {} };
      const rendered = shallow(<Search router={router} />);
      const actual = rendered.instance().actionPath();
      expect(actual).toEqual('/requirements/');
    });
    it('returns the pathname if "policies" is in the pathname', () => {
      const router = { pathname: '/policies', query: {} };
      const rendered = shallow(<Search router={router} />);
      const actual = rendered.instance().actionPath();
      expect(actual).toEqual('/policies');
    });
  });

  describe('handleChange()', () => {
    it('sets the "term" value of state', () => {
      const router = { pathname: '/policies', query: {} };
      const rendered = shallow(<Search router={router} />);
      const input = rendered.find('input[type="text"]');
      input.simulate('change', { target: { value: 'fake-value' } });
      expect(rendered.state().term).toEqual('fake-value');
    });
  });

  it('creates hidden fields for query parameters', () => {
    const router = {
      pathname: '/policies',
      query: {
        requirements__req_text__search: 'text here', // policy-page param
        req_text__search: 'more text', // requirement-page param
        page: '14',
        some: 'param',
        someOther: 'parameter',
      },
    };
    const rendered = shallow(<Search router={router} />);
    const hidden = rendered.find('[type="hidden"]');
    expect(hidden).toHaveLength(3);

    const values = {};
    hidden.forEach((h) => {
      values[h.prop('name')] = h.prop('value');
    });
    expect(values).toEqual({
      req_text__search: 'more text', // requirement-page param is kept
      some: 'param',
      someOther: 'parameter',
    });
  });

  describe('if javascript is not enabled', () => {
    it('sets the form action', () => {
      const router = { pathname: '/policies', query: {} };
      const rendered = shallow(<Search router={router} />);
      const form = rendered.find('form[action="/policies"]');
      expect(form).toHaveLength(1);
    });
  });

  describe('if javascript is enabled', () => {
    it('submit events are intercepted', () => {
      const preventDefault = jest.fn();
      const push = jest.fn();
      const router = { pathname: '/policies', query: {}, push };
      const rendered = shallow(<Search router={router} />);
      const form = rendered.find('form[action="/policies"]');

      form.simulate('submit', { preventDefault });
      expect(preventDefault).toHaveBeenCalled();
    });

    it('router.push is called with all relevant fields', () => {
      const preventDefault = jest.fn();
      const push = jest.fn();
      const router = {
        pathname: '/policies',
        push,
        query: {
          topics__id__in: 36,
        },
      };
      const rendered = shallow(<Search router={router} />);
      const form = rendered.find('form[action="/policies"]');

      form.simulate('submit', { preventDefault });
      expect(push).toHaveBeenCalledWith({
        pathname: '/policies',
        query: {
          requirements__req_text__search: '',
          topics__id__in: 36,
        },
      });
    });
  });

  describe('if rendered with buttonStyle prop', () => {
    it('large returns a large button', () => {
      const router = { pathname: '/no-such-path', query: {} };
      const result = shallow(<Search router={router} buttonStyle='large' />);
      expect(result.find('.filter-form-submit').length).toEqual(1);
    });
    it('small returns a small button', () => {
      const router = { pathname: '/no-such-path', query: {} };
      const result = shallow(<Search router={router} />);
      expect(result.find('.search-submit').length).toEqual(1);
    });
  });
});
