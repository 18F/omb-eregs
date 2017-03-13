import { shallow } from 'enzyme';
import React from 'react';

import Pagers from '../../components/pagers';

describe('<Pagers />', () => {
  it('shows zero pages when there are no results', () => {
    const result = shallow(<Pagers count={0} />);
    expect(result.text()).toMatch(/0 of 0/);
    expect(result.find('Link').length).toEqual(0);
  });

  it('shows one page when there are less than 25 results', () => {
    const result = shallow(<Pagers count={10} />);
    expect(result.text()).toMatch(/1 of 1/);
    expect(result.find('Link').length).toEqual(0);
  });

  it('shows a right arrow but no left arrow when on page 1', () => {
    const result = shallow(<Pagers count={100} location={{ query: { page: '1' } }} />);
    expect(result.text()).toMatch(/1 of 4/);
    expect(result.find('Link').length).toEqual(1);
    expect(result.childAt(0).name()).toBeNull();
    expect(result.childAt(1).name()).toEqual('Link');
  });

  it('shows a left arrow but no right arrow when on final page', () => {
    const result = shallow(<Pagers count={100} location={{ query: { page: '4' } }} />);
    expect(result.text()).toMatch(/4 of 4/);
    expect(result.find('Link').length).toEqual(1);
    expect(result.childAt(0).name()).toEqual('Link');
    expect(result.childAt(1).name()).toBeNull();
  });

  it('shows both arrows if on an intermediary page', () => {
    const result = shallow(<Pagers count={100} location={{ query: { page: '2' } }} />);
    expect(result.text()).toMatch(/2 of 4/);
    expect(result.find('Link').length).toEqual(2);
    expect(result.childAt(0).name()).toEqual('Link');
    expect(result.childAt(1).name()).toBeNull();
    expect(result.childAt(2).name()).toEqual('Link');
  });

  it('handles corner cases around entry count', () => {
    let text = shallow(<Pagers count={49} />).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers count={50} />).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers count={51} />).text();
    expect(text).toMatch(/1 of 3/);
  });

  it('defaults to 1 for bad page numbers', () => {
    const text = shallow(<Pagers count={100} location={{ query: { page: 'abcd' } }} />).text();
    expect(text).toMatch(/1 of 4/);
  });

  it('links to one page less and one more than the current', () => {
    const component = shallow(<Pagers count={125} location={{ query: { page: '3' } }} />);
    expect(component.childAt(0).prop('to').query.page).toEqual(2);
    expect(component.childAt(2).prop('to').query.page).toEqual(4);
  });
});
