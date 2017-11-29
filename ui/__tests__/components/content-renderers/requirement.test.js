import { shallow } from 'enzyme';
import React from 'react';

import Requirement from '../../../components/content-renderers/requirement';

describe('<Requirement />', () => {
  it('includes an icon', () => {
    const result = shallow(<Requirement content={{ inlines: [] }} />);
    const icons = result.find('.fa');
    expect(icons).toHaveLength(1);
    expect(icons.hasClass('fa-star')).toBe(true);
  });
  it('includes all inlines', () => {
    const content = {
      inlines: [
        { content_type: '__text__', text: 'Some ' },
        { content_type: 'external_link',
          href: 'http://example.com/place',
          inlines: [{ content_type: '__text__', text: 'link' }],
          text: 'link',
        },
        { content_type: '__text__', text: ' here.' },
      ],
    };
    const result = shallow(<Requirement content={content} />);
    const externalLinks = result.find('ExternalLink');
    expect(externalLinks).toHaveLength(1);
    expect(externalLinks.prop('content')).toEqual(content.inlines[1]);

    const plainTexts = result.find('PlainText');
    expect(plainTexts).toHaveLength(2);
    expect(plainTexts.first().prop('content')).toEqual(content.inlines[0]);
    expect(plainTexts.last().prop('content')).toEqual(content.inlines[2]);
  });
});
