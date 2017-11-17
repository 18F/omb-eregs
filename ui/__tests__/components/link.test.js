import { shallow } from 'enzyme';
import React from 'react';

import Link from '../../components/link';

jest.mock('../../routes', () => ({
  Link: jest.fn(),
  routes: [{ name: 'route-one' }],
}));

describe('<Link />', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('when given a `route` prop', () => {
    it('renders registered routes as links', () => {
      const result = shallow(<Link route={'route-one'}>hi</Link>);
      expect(result.find('a').length).toEqual(1);
    });
    it('logs an error if the route is not registered', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => null);
      shallow(<Link route={'homepage!'}>hi</Link>);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('when given an `href` prop', () => {
    it('renders a <a>', () => {
      const className = 'red';
      const url = '/some/other/page';
      const result = shallow(<Link className={className} href={url}>hi</Link>);
      const aProps = result.find('a').props();
      expect(aProps.className).toEqual(className);
      expect(aProps.href).toEqual(url);
      expect(aProps['aria-label']).toEqual(undefined);
    });

    // TODO: We're skipping this for now, because setting the aria-label
    // to "Link opens in a new window" obscured the actual destination
    // of the link on ATs. We might bring back this functionality in
    // a better way, though, so for now we'll skip it rather than deleting
    // it entirely. For more details, see:
    //
    //   https://github.com/18F/omb-eregs/issues/655
    it.skip('renders as an external link if the URL includes a protocol', () => {
      const externalUrl = 'https://www.other-site.gov';
      const result = shallow(<Link href={externalUrl}>hi</Link>);
      const aProps = result.find('a').props();
      expect(aProps['aria-label']).toEqual('Link opens in a new window');
      expect(aProps.rel).toEqual('noopener noreferrer');
      expect(aProps.target).toEqual('_blank');
    });
  });

  describe('aria attributes', () => {
    it('are passed through to the underlying link element', () => {
      const ariaLabel = 'Fake aria label';
      const result = shallow(<Link href="/fake" aria-label={ariaLabel}>hi</Link>);
      const aProps = result.find('a').props();
      expect(aProps['aria-label']).toEqual(ariaLabel);
    });
  });
});
