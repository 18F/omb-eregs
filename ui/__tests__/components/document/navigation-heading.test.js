import { shallow } from 'enzyme';
import React from 'react';

import NavigationHeading from '../../../components/document/navigation-heading';

describe('<NavigationHeading />', () => {
  it('works with no children', () => {
    const tocNode = { children: [], identifier: '', title: '' };
    const result = shallow(<NavigationHeading tocNode={tocNode} />);
    const links = result.find('Link');
    expect(links).toHaveLength(1);
  });
  it('includes appropriate text', () => {
    const tocNode = { children: [], identifier: '', title: 'Some Title' };
    const result = shallow(<NavigationHeading tocNode={tocNode} />);
    expect(result.find('Link').children().text()).toBe('Some Title');
  });
  it('links to the right place', () => {
    const tocNode = { children: [], identifier: 'some-id', title: '' };
    const result = shallow(<NavigationHeading tocNode={tocNode} />);
    expect(result.find('Link').prop('href')).toBe('#some-id');
  });
  it('allows only one level of nesting', () => {
    const tocNode = {
      identifier: 'root',
      title: '',
      children: [
        { children: [], identifier: 'child-a', title: 'Child A' },
        { identifier: 'child-b',
          title: 'Child B',
          children: [
            { children: [], identifier: 'subchild-i', title: 'Subchild I' },
            { children: [], identifier: 'subchild-ii', title: 'Subchild II' },
          ],
        },
        { children: [], identifier: 'child-c', title: 'Child C' },
      ],
    };
    const result = shallow(<NavigationHeading tocNode={tocNode} />);
    const links = result.find('Link');
    expect(links).toHaveLength(4);
    expect(links.at(0).prop('href')).toBe('#root');
    expect(links.at(1).prop('href')).toBe('#child-a');
    expect(links.at(1).children().text()).toBe('Child A');
    expect(links.at(2).prop('href')).toBe('#child-b');
    expect(links.at(2).children().text()).toBe('Child B');
    expect(links.at(3).prop('href')).toBe('#child-c');
    expect(links.at(3).children().text()).toBe('Child C');
  });
});

