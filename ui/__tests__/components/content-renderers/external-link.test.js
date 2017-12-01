import { shallow } from 'enzyme';
import React from 'react';

import ExternalLink from '../../../components/content-renderers/external-link';

describe('<ExternalLink />', () => {
  describe('general properties', () => {
    const content = {
      href: 'http://example.com/aaa',
      inlines: [{ content_type: '__text__', text: 'aLink' }],
      text: 'aLink',
    };
    const result = shallow(<ExternalLink content={content} />);

    it('is a Link', () => {
      expect(result.name()).toBe('Link');
    });
    it('includes the right href', () => {
      expect(result.prop('href')).toBe('http://example.com/aaa');
    });
    it('includes the content text', () => {
      expect(result.find('PlainText').prop('content')).toEqual(
        content.inlines[0]);
    });
  });

  describe('print-url style', () => {
    it('is present when the link url is non-obvious', () => {
      const content = {
        href: 'http://example.com/aaa',
        inlines: [],
        text: 'not-that-url',
      };
      const result = shallow(<ExternalLink content={content} />);

      expect(result.hasClass('print-url')).toBe(true);
    });

    it('is not present when the link url is obvious', () => {
      const content = {
        href: 'http://example.com/aaa',
        inlines: [],
        text: 'http://example.com/aaa',
      };
      const result = shallow(<ExternalLink content={content} />);

      expect(result.hasClass('print-url')).toBe(false);
    });
  });

  describe('icon', () => {
    [
      ['http://example.com', 'fa-external-link'],
      ['http://example.com/', 'fa-external-link'],
      ['http://example.com/page', 'fa-external-link'],
      ['http://example.com/page/', 'fa-external-link'],
      ['http://example.com/page.htm', 'fa-external-link'],
      ['http://example.com/page.html', 'fa-external-link'],
      ['http://example.com/page.pdf', 'fa-file-o'],
      ['http://example.com/page.html.tgz', 'fa-file-o'],
    ].forEach(([href, className]) => {
      it(`works correctly for ${href}`, () => {
        const content = { href, inlines: [], text: '' };
        const rendered = shallow(<ExternalLink content={content} />);
        expect(rendered.find('.fa').hasClass(className)).toBe(true);
      });
    });
  });
});

