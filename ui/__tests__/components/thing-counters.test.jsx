import { shallow } from 'enzyme';
import React from 'react';

import ThingCounter from '../../components/thing-counters';
import mockRouter from '../util/mockRouter';


describe('<ThingCounter />', () => {
  it('states zero results when there are no results', () => {
    const context = { router: mockRouter() };
    const result = shallow(<ThingCounter count={0} chunk={0} singular={ "requirement" } plural={ "requirements" }/>, { context });
    expect(result.text()).toMatch(/No requirements match your search, try removing some filters to see more results./);
    expect(result.find("div").length).toEqual(1);
    expect(result.find(".alert .p1 .m1 .border").length).toEqual(1);
  });
  it('states one result when there is one filtered result', () => {
    const context = { router: mockRouter({ query: { topic: 'something' } }) };
    const result = shallow(<ThingCounter count={1} chunk={0} singular={ "requirement" } plural={ "requirements" }/>, { context });
    expect(result.text()).toMatch(/1 requirement matches your search./);
    expect(result.find("div").length).toEqual(1);
    expect(result.find(".alert .p1 .m1 .border").length).toEqual(0);
  });
  it('states two results when there are two filtered results', () => {
    const context = { router: mockRouter({ query: { topic: 'something' } }) };
    const result = shallow(<ThingCounter count={2} chunk={0} singular={ "requirement" } plural={ "requirements" }/>, { context });
    expect(result.text()).toMatch(/2 requirements match your search./);
    expect(result.find("div").length).toEqual(1);
    expect(result.find(".alert .p1 .m1 .border").length).toEqual(0);
  });
  it('states one total result when there is one total result', () => {
    const context = { router: mockRouter() };
    const result = shallow(<ThingCounter count={1} chunk={0} singular={ "requirement" } plural={ "requirements" }/>, { context });
    expect(result.text()).toMatch(/1 requirement./);
    expect(result.find("div").length).toEqual(1);
    expect(result.find(".alert .p1 .m1 .border").length).toEqual(0);
  });
  it('states two total results when there are two two results', () => {
    const context = { router: mockRouter() };
    const result = shallow(<ThingCounter count={2} chunk={0} singular={ "requirement" } plural={ "requirements" }/>, { context });
    expect(result.text()).toMatch(/2 requirements./);
    expect(result.find("div").length).toEqual(1);
    expect(result.find(".alert .p1 .m1 .border").length).toEqual(0);
  });

});

