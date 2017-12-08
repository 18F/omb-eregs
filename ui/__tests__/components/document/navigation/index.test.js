import { shallow } from 'enzyme';
import React from 'react';

import { DocumentNav } from '../../../../components/document/navigation';

describe('<DocumentNav />', () => {
  const emptyToC = { children: [], identifier: 'ididid', title: 'ttt' };
  describe('the isRoot prop', () => {
    const result = shallow(<DocumentNav isRoot tableOfContents={emptyToC} />);
    it('adds a new class name', () => {
      expect(result.hasClass('document-nav')).toBe(true);
    });
    it('generates a "Top" link', () => {
      const links = result.find('Connect(NavLink)');
      expect(links).toHaveLength(1);
      expect(links.prop('identifier')).toBe('ididid');
      expect(links.prop('title')).toBe('Top');
    });
  });
  it('is recursive', () => {
    const toc = {
      identifier: 'root',
      title: '',
      children: [
        { children: [], identifier: 'child1', title: 'A Child' },
        { children: [], identifier: 'child2', title: 'Another Child' },
        { identifier: 'child3',
          title: 'Third Child',
          children: [
            { children: [], identifier: 'subchild-a', title: 'SubChild' },
          ],
        },
      ],
    };
    const result = shallow(<DocumentNav tableOfContents={toc} />);
    const links = result.find('Connect(NavLink)');
    expect(links).toHaveLength(3);
    expect(links.at(0).prop('identifier')).toBe('child1');
    expect(links.at(0).prop('title')).toBe('A Child');
    expect(links.at(1).children()).toHaveLength(0);
    const thirdChildren = links.at(2).children();
    expect(thirdChildren).toHaveLength(1);
    expect(thirdChildren.name()).toBe('DocumentNav');
    expect(thirdChildren.prop('className')).toBe('sub-sections');
    expect(thirdChildren.prop('tableOfContents').identifier).toBe('child3');
  });
  it('includes passed in className', () => {
    const result = shallow(
      <DocumentNav className="some klazzes" tableOfContents={emptyToC} />);
    expect(result.hasClass('document-nav')).toBe(false);
    expect(result.hasClass('some')).toBe(true);
    expect(result.hasClass('klazzes')).toBe(true);
  });
});

