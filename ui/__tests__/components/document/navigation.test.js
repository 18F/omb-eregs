import { shallow } from 'enzyme';
import React from 'react';

import DocumentNav from '../../../components/document/navigation';
import DocumentNode from '../../../util/document-node';

describe('<DocumentNav />', () => {
  it('generates a "Top" link', () => {
    const docNode = new DocumentNode({ meta: { table_of_contents: {
      children: [], identifier: 'some-id', title: 'Some Title',
    } } });
    const result = shallow(<DocumentNav docNode={docNode} />);
    const links = result.find('Link');
    expect(links).toHaveLength(1);
    expect(links.children().text()).toBe('Top');
    expect(links.prop('href')).toBe('#some-id');
  });
  it('includes all of the table of contents', () => {
    const docNode = new DocumentNode({ meta: { table_of_contents: {
      children: [
        { identifier: 'thing1', title: 'Thing1', children: [] },
        { identifier: 'thing2', title: 'Thing2', children: [] },
        { identifier: 'thing3', title: 'Thing3', children: [] },
      ],
      identifier: 'some-id',
      title: 'Some Title',
    } } });
    const result = shallow(<DocumentNav docNode={docNode} />);
    const links = result.find('NavigationHeading');
    expect(links).toHaveLength(3);
    expect(links.at(0).prop('tocNode').title).toBe('Thing1');
    expect(links.at(1).prop('tocNode').title).toBe('Thing2');
    expect(links.at(2).prop('tocNode').title).toBe('Thing3');
  });
  it('includes passed in className', () => {
    const docNode = new DocumentNode({ meta: { table_of_contents: {
      children: [], identifier: '', title: '',
    } } });
    const noClass = shallow(<DocumentNav docNode={docNode} />);
    expect(noClass.hasClass('document-nav')).toBe(true);

    const someClass = shallow(
      <DocumentNav className="some thing" docNode={docNode} />);
    expect(someClass.hasClass('document-nav')).toBe(true);
    expect(someClass.hasClass('some')).toBe(true);
    expect(someClass.hasClass('thing')).toBe(true);
  });
});
