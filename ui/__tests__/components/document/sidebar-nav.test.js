import { shallow } from 'enzyme';
import React from 'react';

import DocumentNav from '../../../components/document/navigation';
import SidebarNav from '../../../components/document/sidebar-nav';

describe('<SidebarNav />', () => {
  it('includes a sticky DocumentNav', () => {
    const result = shallow(<SidebarNav />);
    const sticky = result.find('Sticky');
    expect(sticky).toHaveLength(1);
    expect(sticky.children().type()).toBe(DocumentNav);
  });
  it('passes className', () => {
    const result = shallow(<SidebarNav className="some classes here" />);
    expect(result.hasClass('some')).toBe(true);
    expect(result.hasClass('classes')).toBe(true);
    expect(result.hasClass('here')).toBe(true);
  });
  it('passes bottomBoundary', () => {
    const result = shallow(<SidebarNav bottomBoundary=".a-selector" />);
    expect(result.find('Sticky').prop('bottomBoundary')).toBe('.a-selector');
  });
});

