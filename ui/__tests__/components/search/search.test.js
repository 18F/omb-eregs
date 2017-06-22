import { shallow } from 'enzyme';
import React from 'react';

import Search from '../../../components/search/search';


describe('<Search />', () => {
  it('creates hidden fields for query parameters', () => {
    const context = { router: { location: {
      pathname: '/policies',
      query: {
        requirements__req_text__search: 'text here',  // policy-page param
        req_text__search: 'more text',  // requirement-page param
        page: '14',
        some: 'param',
        someOther: 'parameter',
      },
    } } };
    const rendered = shallow(React.createElement(Search), { context });
    const hidden = rendered.find('[type="hidden"]');
    expect(hidden).toHaveLength(3);

    const values = {};
    hidden.forEach((h) => {
      values[h.prop('name')] = h.prop('value');
    });
    expect(values).toEqual({
      req_text__search: 'more text',  // requirement-page param is kept
      some: 'param',
      someOther: 'parameter',
    });
  });
});
