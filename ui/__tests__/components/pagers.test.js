import { shallow } from 'enzyme';
import React from 'react';

import { Pagers } from '../../components/pagers';

function pagerArgs(count, query = null) {
  return {
    count,
    route: 'requirements',
    router: { pathname: '', query: query || {} },
  };
}

describe('<Pagers />', () => {
  it('shows zero pages when there are no results', () => {
    const result = shallow(<Pagers {...pagerArgs(0)} />);
    expect(result.text()).toMatch(/0 of 0/);
    expect(result.find('LinkRoutes').length).toEqual(0);
  });

  it('shows one page when there are less than 25 results', () => {
    const result = shallow(<Pagers {...pagerArgs(10)} />);
    expect(result.text()).toMatch(/1 of 1/);
    expect(result.find('LinkRoutes').length).toEqual(0);
  });

  it('shows a right arrow but no left arrow when on page 1', () => {
    const result = shallow(<Pagers {...pagerArgs(100, { page: '1' })} />);
    expect(result.text()).toMatch(/1 of 4/);
    expect(result.find('LinkRoutes').length).toEqual(1);
    expect(result.childAt(0).name()).toBeNull();
    expect(result.childAt(1).name()).toEqual('LinkRoutes');
  });

  it('shows a left arrow but no right arrow when on final page', () => {
    const result = shallow(<Pagers {...pagerArgs(100, { page: '4' })} />);
    expect(result.text()).toMatch(/4 of 4/);
    expect(result.find('LinkRoutes').length).toEqual(1);
    expect(result.childAt(0).name()).toEqual('LinkRoutes');
    expect(result.childAt(1).name()).toBeNull();
  });

  it('shows both arrows if on an intermediary page', () => {
    const result = shallow(<Pagers {...pagerArgs(100, { page: '2' })} />);
    expect(result.text()).toMatch(/2 of 4/);
    expect(result.find('LinkRoutes').length).toEqual(2);
    expect(result.childAt(0).name()).toEqual('LinkRoutes');
    expect(result.childAt(1).name()).toBeNull();
    expect(result.childAt(2).name()).toEqual('LinkRoutes');
  });

  it('handles corner cases around entry count', () => {
    let text = shallow(<Pagers {...pagerArgs(49)} />).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers {...pagerArgs(50)} />).text();
    expect(text).toMatch(/1 of 2/);

    text = shallow(<Pagers {...pagerArgs(51)} />).text();
    expect(text).toMatch(/1 of 3/);
  });

  it('defaults to 1 for bad page numbers', () => {
    const text = shallow(<Pagers {...pagerArgs(100, { page: 'abcd' })} />).text();
    expect(text).toMatch(/1 of 4/);
  });

  it('links to one page less and one more than the current', () => {
    const component = shallow(<Pagers {...pagerArgs(125, { page: '3' })} />);
    expect(component.childAt(0).prop('params').page).toEqual(2);
    expect(component.childAt(2).prop('params').page).toEqual(4);
  });
});
