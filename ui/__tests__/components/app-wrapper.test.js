import { mount } from 'enzyme';
import React from 'react';

import wrapPage from '../../components/app-wrapper';
import HeaderFooter from '../../components/header-footer';
import initialState from '../../store/initial-state';

jest.mock('../../components/header-footer', () => jest.fn());


describe('wrapPage()', () => {
  const ExamplePage = () => <div>Content</div>;

  describe('getInitialProps()', () => {
    it('passes fetched data', async () => {
      const dataFn = jest.fn(async () => ({ some: 'data' }));
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps({ a: 'context' });

      expect(results.initialProps).toEqual({ some: 'data' });
      expect(dataFn).toHaveBeenCalledTimes(1);
      const firstArg = dataFn.mock.calls[0][0];
      expect(firstArg.a).toBe('context');
    });
    it('handles errors', async () => {
      const err = new Error('oy');
      const dataFn = jest.fn(async () => { throw err; });
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps();

      expect(results.initialProps).toEqual({ err });
    });
    it('allows fetched data to trigger a 404', async () => {
      const dataFn = jest.fn(async () => ({ statusCode: 404 }));
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps();

      expect(results.initialProps).toEqual({ statusCode: 404 });
    });
    it('includes redux', async () => {
      const dataFn = jest.fn(async () => ({}));
      const Wrapped = wrapPage(ExamplePage, dataFn);
      const results = await Wrapped.getInitialProps();

      expect(results.initialState).toEqual(initialState);
    });
  });
  describe('render()', () => {
    const Wrapped = wrapPage(ExamplePage, jest.fn());
    it('renders content if no error', () => {
      HeaderFooter.mockImplementationOnce(({ children }) => (
        <div className="hf">{ children }</div>
      ));
      const result = mount(<Wrapped arg1="some value" />);
      expect(result.find('ErrorView')).toHaveLength(0);

      const hf = result.find('.hf');
      expect(hf).toHaveLength(1);
      expect(hf.find('ExamplePage')).toHaveLength(1);
      expect(hf.find('ExamplePage').first().prop('arg1')).toBe('some value');
    });
    it('renders an error, with no explicit status code', () => {
      const err = new Error('oh noes');
      const result = mount(<Wrapped err={err} />).find('ErrorView');

      expect(result).toHaveLength(1);
      expect(result.props()).toEqual({ err, statusCode: null });
    });
    it('renders an error, with an explicit status code', () => {
      // HeaderFooter is present in the 404 page
      HeaderFooter.mockImplementationOnce(() => null);
      const result = mount(<Wrapped statusCode={404} />).find('ErrorView');

      expect(result).toHaveLength(1);
      expect(result.props()).toEqual({ err: null, statusCode: 404 });
    });
  });
});
