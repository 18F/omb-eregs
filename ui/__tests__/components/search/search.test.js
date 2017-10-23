import { shallow } from 'enzyme';
import React from 'react';

import { Search } from '../../../components/search/search';

const blankRouter = { pathname: '', query: {} };


describe('<Search />', () => {
  describe('actionPath()', () => {
    it('returns /policies by default', () => {
      const router = { pathname: '/no-such-path', query: {} };
      const rendered = shallow(<Search router={router} />);
      const actual = rendered.instance().actionPath();
      expect(actual).toEqual('/policies');
    });
    it('returns the current path if in our whitelist', () => {
      const router = { pathname: '/requirements', query: {} };
      const rendered = shallow(<Search router={router} />);
      const actual = rendered.instance().actionPath();
      expect(actual).toEqual('/requirements');
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
  it('does not create hidden fields on other pages', () => {
    const router = {
      pathname: '/some-other-page',
      query: { some: 'value' },
    };
    const rendered = shallow(<Search router={router} />);
    const hidden = rendered.find('[type="hidden"]');
    expect(hidden).toHaveLength(0);
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

    it('adds fields to router.push when on a whitelisted page', () => {
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
    it('does not add fields to router.push if not on a whitelist page', () => {
      const preventDefault = jest.fn();
      const push = jest.fn();
      const router = {
        pathname: '/about-stuff',
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
        query: { requirements__req_text__search: '' },
      });
    });
  });

  describe('buttonContent prop', () => {
    it('can be a React.Component', () => {
      const params = {
        buttonContent: <div className="content-here">Content!</div>,
        router: blankRouter,
      };
      const rendered = shallow(<Search {...params} />);
      expect(rendered.find('button .content-here')).toHaveLength(1);
      const content = rendered.find('button .content-here').first();
      expect(content.text()).toEqual('Content!');
      expect(content.name()).toEqual('div');
    });

    it('can be plain text', () => {
      const params = { buttonContent: 'I am a button', router: blankRouter };
      const button = shallow(<Search {...params} />).find('button').first();
      expect(button.text()).toEqual('I am a button');
    });
  });

  describe('placeholder prop', () => {
    it('has a sane default', () => {
      const input = shallow(<Search router={blankRouter} />)
        .find('[type="text"]').first();
      expect(input.prop('placeholder')).toEqual('Search');
    });
    it('can be configured', () => {
      const input = shallow(<Search placeholder="Hiya!" router={blankRouter} />)
        .find('[type="text"]').first();
      expect(input.prop('placeholder')).toEqual('Hiya!');
    });
  });
});
