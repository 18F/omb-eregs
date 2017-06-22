import { shallow } from 'enzyme';
import React from 'react';

import ThingCounter from '../../components/thing-counters';
import mockRouter from '../util/mockRouter';

function makeReqThing(count, context) {
    return shallow(<ThingCounter count={count} singular="requirement" plural="requirements"/>, { context });
}

describe('<ThingCounter />', () => {
  it('states zero results when there are no results', () => {
    const context = { router: mockRouter() };
    const result = makeReqThing(0, context);
    expect(result.text()).toMatch(/No requirements match your search, try removing some filters to see more results./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(1);
  });
  it('states one result when there is one filtered result', () => {
    const context = { router: mockRouter({ query: { topic: 'something' } }) };
    const result = makeReqThing(1, context)
    expect(result.text()).toMatch(/1 requirement matches your search./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two results when there are two filtered results', () => {
    const context = { router: mockRouter({ query: { topic: 'something' } }) };
    const result = makeReqThing(2, context)
    expect(result.text()).toMatch(/2 requirements match your search./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states one total result when there is one total result', () => {
    const context = { router: mockRouter() };
    const result = makeReqThing(1, context)
    expect(result.text()).toMatch(/1 requirement\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two total results when there are two total results', () => {
    const context = { router: mockRouter() };
    const result = makeReqThing(2, context)
    expect(result.text()).toMatch(/2 requirements\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });

});

