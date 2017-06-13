import { shallow } from 'enzyme';
import React from 'react';

import Pagers from '../../components/pagers';
import mockRouter from '../util/mockRouter';


describe('<Pagers />', () => {
  it('shows zero pages when there are no results', () => {
    const context = { router: mockRouter() };
    const result = shallow(<Pagers count={0} />, { context });
    expect(result.text()).toMatch(/No requirements match your search, try removing some filters to see more results./);
    expect(result.find('Link').length).toEqual(0);
  });

  it('shows one page when there are less than 25 results', () => {
    const context = { router: mockRouter() };
    const result = shallow(<Pagers count={10} />, { context });
    expect(result.text()).toMatch(/1 of 1/);
    expect(result.find('Link').length).toEqual(0);
  });

  it('shows a right arrow but no left arrow when on page 1', () => {
    const context = { router: mockRouter({ query: { page: '1' } }) };
    const result = shallow(<Pagers count={100} />, { context });
    expect(result.text()).toMatch(/1 of 4/);
    expect(result.find('Link').length).toEqual(1);
    expect(result.childAt(0).name()).toBeNull();
    expect(result.childAt(1).name()).toEqual('Link');
  });

  it('shows a left arrow but no right arrow when on final page', () => {
    const context = { router: mockRouter({ query: { page: '4' } }) };
    const result = shallow(<Pagers count={100} />, { context });
    expect(result.text()).toMatch(/4 of 4/);
    expect(result.find('Link').length).toEqual(1);
    expect(result.childAt(0).name()).toEqual('Link');
    expect(result.childAt(1).name()).toBeNull();
  });

  it('shows both arrows if on an intermediary page', () => {
    const context = { router: mockRouter({ query: { page: '2' } }) };
    const result = shallow(<Pagers count={100} />, { context });
    expect(result.text()).toMatch(/2 of 4/);
    expect(result.find('Link').length).toEqual(2);
    expect(result.childAt(0).name()).toEqual('Link');
    expect(result.childAt(1).name()).toBeNull();
    expect(result.childAt(2).name()).toEqual('Link');
  });

  it('handles corner cases around entry count', () => {
    const context = { router: mockRouter() };
    let text = shallow(<Pagers count={49} />, { context }).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers count={50} />, { context }).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers count={51} />, { context }).text();
    expect(text).toMatch(/1 of 3/);
  });

  it('defaults to 1 for bad page numbers', () => {
    const context = { router: mockRouter({ query: { page: 'abcd' } }) };
    const text = shallow(<Pagers count={100} />, { context }).text();
    expect(text).toMatch(/1 of 4/);
  });

  it('links to one page less and one more than the current', () => {
    const context = { router: mockRouter({ query: { page: '3' } }) };
    const component = shallow(<Pagers count={125} />, { context });
    expect(component.childAt(0).prop('to').query.page).toEqual(2);
    expect(component.childAt(2).prop('to').query.page).toEqual(4);
  });
});
