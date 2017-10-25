import { shallow } from 'enzyme';
import React from 'react';

import { Policy } from '../../pages/policy';
import { Router } from '../../routes';

jest.mock('../../routes', () => ({
  routes: [],
  Router: { router: { changeState: jest.fn() } },
}));


describe('<Policy />', () => {
  const mockProps = {
    pagedReqs: {
      count: 0,
      results: [],
    },
    policy: {
      issuance_pretty: 'Some date',
      title_with_number: 'A title',
    },
    url: {
      query: {
        policyId: '5',
      },
    },
  };

  it('has an initial state based on the query params', () => {
    const props = {
      ...mockProps,
      url: { query: { policyId: '5', reqId: '12' } },
    };
    const result = shallow(<Policy {...props} />);
    expect(result.state('focusReq')).toEqual('12');
  });

  describe('reqs()', () => {
    const props = {
      ...mockProps,
      pagedReqs: {
        count: 2,
        results: [
          { id: 123, req_id: '11.22', req_text: '', topics: [] },
          { id: 456, req_id: '22.33', req_text: '', topics: [] },
        ],
      },
      url: { query: { page: '8', policyId: '5', reqId: '456' } },
    };

    it('configures Reqs', () => {
      const reqs = shallow(<Policy {...props} />).find('Req');
      expect(reqs).toHaveLength(2);

      const [req123, req456] = [reqs.first(), reqs.last()];
      expect(req123.prop('highlighted')).toBeFalsy();
      expect(req123.prop('href')).toEqual('/policy/5/123?page=8#11.22');
      expect(req123.prop('req').id).toEqual(123);

      expect(req456.prop('highlighted')).toBeTruthy();
      expect(req456.prop('href')).toEqual('/policy/5/456?page=8#22.33');
      expect(req456.prop('req').id).toEqual(456);
    });

    it('they set the highlight when clicked', () => {
      const rendered = shallow(<Policy {...props} />);
      const policy = rendered.instance();
      const reqs = rendered.find('Req');
      policy.setHighlight = jest.fn();

      const [req123, req456] = [reqs.first(), reqs.last()];
      const clickEvent = { preventDefault: jest.fn() };

      req123.simulate('click', clickEvent);
      expect(policy.setHighlight).toHaveBeenCalledWith('123', '11.22');
      expect(clickEvent.preventDefault).toHaveBeenCalled();

      req456.simulate('click', clickEvent);
      expect(policy.setHighlight).toHaveBeenCalledWith('456', '22.33');
    });
  });

  describe('setHighlight', () => {
    const props = {
      ...mockProps,
      pagedReqs: {
        count: 1,
        results: [
          { id: 123, req_id: '11.22', req_text: '', topics: [] },
        ],
      },
      url: { query: { page: '8', policyId: '5' } },
    };

    it('sets the appropriate state', () => {
      const policy = shallow(<Policy {...props} />);
      expect(policy.state('focusReq')).toBeUndefined();
      policy.instance().setHighlight('123', '11.22');
      expect(policy.state('focusReq')).toEqual('123');
    });

    it('calls the router', () => {
      const policy = shallow(<Policy {...props} />).instance();
      policy.setHighlight('123', '11.22');
      expect(Router.router.changeState).toBeCalledWith(
        'replaceState',
        '/policy?policyId=5&reqId=123&page=8#11.22',
        '/policy/5/123?page=8#11.22',
      );
    });
  });

  describe('render()', () => {
    it('includes policy info', () => {
      const props = {
        ...mockProps,
        policy: {
          issuance_pretty: 'Pretty',
          title_with_number: 'Title Title',
        },
      };
      const text = shallow(<Policy {...props} />).text();
      expect(text).toMatch(/Pretty/);
      expect(text).toMatch(/Title Title/);
    });

    it('includes a configured PageCounter', () => {
      const props = {
        ...mockProps,
        pagedReqs: { count: 12345, results: [] },
        url: { query: { page: '54', policyId: '98' } },
      };
      const pageCounters = shallow(<Policy {...props} />).find('PageCounter');
      expect(pageCounters).toHaveLength(1);
      expect(pageCounters.first().props()).toEqual({
        count: 12345,
        page: '54',
        pageSize: 25,
      });
    });

    it('includes a configured Pagers', () => {
      const props = {
        ...mockProps,
        pagedReqs: { count: 12345, results: [] },
      };
      const pagerses = shallow(<Policy {...props} />).find('withRoute(Pagers)');
      expect(pagerses).toHaveLength(1);
      expect(pagerses.first().props()).toEqual({
        count: 12345,
        route: 'policy',
      });
    });
  });
});
