import { shallow } from 'enzyme';
import React from 'react';

import ExternalLink from '../../../components/content-renderers/external-link';

describe('<ExternalLink />', () => {
  describe('general properties', () => {
    const content = { href: 'http://example.com/aaa', text: 'aLink' };
    const result = shallow(<ExternalLink content={content} />);

    it('is a Link', () => {
      expect(result.name()).toBe('Link');
    });
    it('includes the right href', () => {
      expect(result.prop('href')).toBe('http://example.com/aaa');
    });
    it('includes the content text', () => {
      expect(result.children().text()).toBe('aLink');
    });
  });

  describe('print-url style', () => {
    it('is present when the link url is non-obvious', () => {
      const content = { href: 'http://example.com/aaa', text: 'not-that-url' };
      const result = shallow(<ExternalLink content={content} />);

      expect(result.prop('className')).toBe('print-url');
    });

    it('is not present when the link url is obvious', () => {
      const content = {
        href: 'http://example.com/aaa',
        text: 'http://example.com/aaa',
      };
      const result = shallow(<ExternalLink content={content} />);

      expect(result.prop('className')).toBe('');
    });
  });
});

