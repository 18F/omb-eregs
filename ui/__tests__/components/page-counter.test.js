import { shallow } from 'enzyme';
import React from 'react';
import PageCounter from '../../components/page-counter';


describe('<PageCounter />', () => {
  it('has reasonable defaults', () => {
    const text = shallow(<PageCounter count={100} />).text();
    expect(text).toMatch(/page 1 of 4/);
  });

  it('shows the current page number', () => {
    const text = shallow(<PageCounter count={100} page="4" />).text();
    expect(text).toMatch(/page 4 of 4/);
  });

  it('calculates the last page number', () => {
    const text = shallow(<PageCounter count={1234} pageSize={100} />).text();
    expect(text).toMatch(/page 1 of 13/); // last page has 34 entries
  });

  it('handles zero results', () => {
    const text = shallow(<PageCounter count={0} />).text();
    expect(text).toMatch(/page 1 of 1/);
  });
});
