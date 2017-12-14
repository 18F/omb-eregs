import { shallow } from 'enzyme';
import React from 'react';

import FloatingNav from '../../../components/document/floating-nav';
import DocumentNav from '../../../components/document/navigation';

describe('<FloatingNav />', () => {
  it('is wrapped in a Sticky', () => {
    const result = shallow(<FloatingNav />);
    expect(result.name()).toBe('Sticky');
  });
  it('displays a DocumentNav when open', () => {
    const result = shallow(<FloatingNav />);
    expect(result.children().find(DocumentNav)).toHaveLength(0);
    result.setState({ open: true });
    expect(result.children().find(DocumentNav)).toHaveLength(1);
  });
  it('has has a button to toggle states', () => {
    const result = shallow(<FloatingNav />);
    expect(result.state('open')).toBe(false);
    result.children().find('.menu-button').simulate('click');
    expect(result.state('open')).toBe(true);
  });
  it('toggles text and classes on the button', () => {
    const result = shallow(<FloatingNav />);
    let button = result.children().find('.menu-button');
    expect(button.hasClass('active')).toBe(false);
    expect(button.text()).toBe('Jump to section');

    result.setState({ open: true });
    button = result.children().find('.menu-button');
    expect(button.hasClass('active')).toBe(true);
    expect(button.text()).toBe('✕');
  });
  it('passes a "close" onClick handler to the DocumentNav', () => {
    const result = shallow(<FloatingNav />);
    result.setState({ open: true });
    const onClick = result.children().find(DocumentNav).prop('onClick');
    expect(result.state('open')).toBe(true);
    onClick();
    expect(result.state('open')).toBe(false);
  });
});
