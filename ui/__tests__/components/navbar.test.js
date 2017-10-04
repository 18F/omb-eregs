import { mount, shallow } from 'enzyme';
import React from 'react';

import Navbar from '../../components/navbar';
import SearchContainer from '../../components/search/search';


describe('<Navbar />', () => {
  it('without a search bar when showSearch is false', () => {
    const result = shallow(<Navbar showSearch={ false }/>);
    expect(result.find(SearchContainer).length).toEqual(0);
  });

  it('show search bar when showSearch is true', () => {
    const result = shallow(<Navbar showSearch={ true }/>);
    expect(result.find(SearchContainer).length).toEqual(1);
  });
});
